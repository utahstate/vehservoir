import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from 'src/services/reservation';
import { VehicleService } from 'src/services/vehicle';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FreeVehicleQueryBlocks } from 'src/slack_blocks/FreeVehicleQueryBlocks';
import { Free } from 'dto/vehicles/Free';
import { validateSync } from 'class-validator';
import { applyTimezoneOffset } from 'src/utils/dates';
import { ReserveVehicleBlock } from 'src/slack_blocks/ReserveVehicleBlocks';

export interface ReservationFindAvailableViewState {
  type: {
    type: { type: string; selected_option: { text: string; value: string } };
  };
  startDate: { startDate: { type: string; selected_date: string } };
  endDate: { endDate: { type: string; selected_date: string } };
  startTime: { startTime: { type: string; selected_time: string } };
  endTime: { endTime: { type: string; selected_time: string } };
  reservationPeriod: {
    reservationPeriod: {
      type: string;
      selected_option: { text: string; value: string };
    };
  };
}

export interface ReservationRequestViewState {
  reservation: {
    reservation: {
      type: string;
      selected_option: {
        text: string;
        value: string;
      };
    };
  };
}

export enum ReserveModal {
  FINDING_VEHICLE,
  RESERVING_VEHICLE,
}

export interface ViewState {
  modal: ReserveModal;
  params: any;
  user: SlackUser;
}

export interface SlackUser {
  id: number;
  real_name: string;
  tz_offset: number;
  tz: string;
}

@Controller()
export class SlackController {
  private viewStates: Record<string, ViewState>; // Preserves Slack modal state per view
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
    private configService: ConfigService,
  ) {
    this.viewStates = {};
  }

  private async getUserDetails(user_id: string): Promise<SlackUser> {
    const { tz, tz_offset, id, real_name } = (
      await axios.get('https://slack.com/api/users.info', {
        params: {
          user: user_id,
        },
        headers: {
          Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
        },
      })
    ).data.user;
    return { tz, tz_offset, id, real_name };
  }

  private async makeReservation(bodyPayload: any) {
    const reservationValues = bodyPayload.view.state
      .values as ReservationRequestViewState;
    console.log(
      reservationValues.reservation.reservation.selected_option.value,
    );
  }

  private async getReservableOrErrors(
    bodyPayload: any,
    userTimezoneOffset: number,
  ) {
    const findVehicleValues = bodyPayload.view.state
      .values as ReservationFindAvailableViewState;
    const startDate = applyTimezoneOffset(
      new Date(
        `${findVehicleValues.startDate.startDate.selected_date}T${findVehicleValues.startTime.startTime.selected_time}Z`,
      ),
      userTimezoneOffset,
    );
    const endDate = applyTimezoneOffset(
      new Date(
        `${findVehicleValues.endDate.endDate.selected_date}T${findVehicleValues.endTime.endTime.selected_time}Z`,
      ),
      userTimezoneOffset,
    );

    const validateFreeBody = new Free(
      findVehicleValues.type.type.selected_option.value,
      parseFloat(
        findVehicleValues.reservationPeriod.reservationPeriod.selected_option
          .value,
      ),
      startDate,
      endDate,
    );

    const errors = validateSync(validateFreeBody).map((err) =>
      Object.keys(err.constraints)
        .map((constraint) => err.constraints[constraint])
        .join(', '),
    );
    if (startDate.getTime() < Date.now() - 5 * 60 * 1000) {
      errors.push(
        'Start time must be in the future or within the past 5 minutes',
      );
    }
    if (errors.length) {
      return { errors };
    }

    const vehicleAvailabilities =
      VehicleService.filterAvailabilitiesByPeriodExtension(
        await this.vehicleService.vehicleFreePeriodsBy(
          {
            type: parseInt(
              findVehicleValues.type.type.selected_option.value,
              10,
            ),
          },
          startDate,
          endDate,
        ),
        validateFreeBody.periodSeconds,
      );

    if (!vehicleAvailabilities) {
      return {
        errors: [
          'No available vehicles could be found. Decrease reservation length, change type, or increase available search period.',
        ],
      };
    }

    return {
      vehicleAvailabilities,
      periodSeconds: validateFreeBody.periodSeconds,
    };
  }

  @Post('/api/slack/interactions')
  async getInteraction(@Body() body: { payload: string }): Promise<any> {
    const bodyPayload = JSON.parse(body.payload);

    const oldExternalId = bodyPayload.view.external_id;
    if (bodyPayload.type === 'view_closed') {
      if (bodyPayload.is_cleared) {
        delete this.viewStates[oldExternalId];
      } else if (
        this.viewStates[oldExternalId].modal === ReserveModal.RESERVING_VEHICLE
      ) {
        this.viewStates[oldExternalId].modal = ReserveModal.FINDING_VEHICLE;
      } else {
        delete this.viewStates[oldExternalId];
      }
    }

    if (bodyPayload.type === 'view_submission') {
      const external_id = uuidv4();
      const oldState = this.viewStates[oldExternalId];
      this.viewStates[external_id] = { ...oldState };
      delete this.viewStates[oldExternalId];

      switch (oldState.modal) {
        case ReserveModal.RESERVING_VEHICLE:
          this.makeReservation(bodyPayload);
          delete this.viewStates[oldExternalId];
          return {
            response_action: 'clear',
          };
        default:
          const { errors, periodSeconds, vehicleAvailabilities } =
            await this.getReservableOrErrors(
              bodyPayload,
              this.viewStates[external_id].user.tz_offset,
            );

          if (errors) {
            this.viewStates[external_id].modal = ReserveModal.FINDING_VEHICLE;
            this.viewStates[external_id].params.error = errors
              .map((x) => `* ${x}`)
              .join('\n');
            return {
              response_action: 'update',
              view: JSON.stringify({
                external_id,
                notify_on_close: true,
                ...FreeVehicleQueryBlocks(this.viewStates[external_id]),
              }),
            };
          }
          this.viewStates[external_id].modal = ReserveModal.RESERVING_VEHICLE;
          this.viewStates[external_id].params = {
            vehicleAvailabilities,
            periodSeconds,
          };
          return {
            response_action: 'push',
            view: JSON.stringify({
              external_id,
              notify_on_close: true,
              ...ReserveVehicleBlock(this.viewStates[external_id]),
            }),
          };
      }
    }
  }

  @Post('/api/slack/reserve')
  async makeReserve(@Body() req): Promise<string> {
    const external_id = uuidv4();

    const viewState = {
      modal: ReserveModal.FINDING_VEHICLE,
      params: {
        vehicleTypes: await this.vehicleService.allVehicleTypes(),
      },
      user: await this.getUserDetails(req.user_id),
    };
    this.viewStates[external_id] = viewState;

    axios.post(
      'https://slack.com/api/views.open',
      {
        trigger_id: req.trigger_id,
        view: JSON.stringify({
          external_id,
          notify_on_close: true,
          ...FreeVehicleQueryBlocks(viewState),
        }),
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return 'Please fill out the form';
  }
}
