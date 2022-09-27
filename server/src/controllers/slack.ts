import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from 'src/services/reservation';
import { VehicleService } from 'src/services/vehicle';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FreeVehicleQueryBlocks } from 'src/slack_blocks/FreeVehicleQueryBlocks';
import { Free } from 'dto/vehicles/Free';
import { validateSync } from 'class-validator';
import { applyTimezoneOffset, toTimeZone } from 'src/utils/dates';
import { ReserveVehicleBlock } from 'src/slack_blocks/ReserveVehicleBlocks';

interface ReservationFindAvailableViewState {
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

enum ReserveState {
  FINDING_VEHICLE,
  RESERVING_VEHICLE,
}
@Controller()
export class SlackController {
  private viewStates: Record<string, ReserveState>; // Preserves Slack modal state per view
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
    private configService: ConfigService,
  ) {
    this.viewStates = {};
  }

  private async getUserTimezoneDetails(
    user_id: string,
  ): Promise<{ offset: number; name: string }> {
    const response = await axios.get('https://slack.com/api/users.info', {
      params: {
        user: user_id,
      },
      headers: {
        Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
      },
    });
    return {
      offset: response.data.user.tz_offset,
      name: response.data.user.tz,
    };
  }

  private async getReservableOrErrors(
    bodyPayload: any,
    userTimezoneOffset: number,
  ) {
    const reservationValues = bodyPayload.view.state
      .values as ReservationFindAvailableViewState;
    const startDate = applyTimezoneOffset(
      new Date(
        `${reservationValues.startDate.startDate.selected_date}T${reservationValues.startTime.startTime.selected_time}Z`,
      ),
      userTimezoneOffset,
    );
    const endDate = applyTimezoneOffset(
      new Date(
        `${reservationValues.endDate.endDate.selected_date}T${reservationValues.endTime.endTime.selected_time}Z`,
      ),
      userTimezoneOffset,
    );

    const validateFreeBody = new Free(
      reservationValues.type.type.selected_option.value,
      parseFloat(
        reservationValues.reservationPeriod.reservationPeriod.selected_option
          .value,
      ) *
        60 *
        60,
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
              reservationValues.type.type.selected_option.value,
              10,
            ),
          },
          startDate,
          endDate,
        ),
        validateFreeBody.period,
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
    };
  }

  @Post('/api/slack/interactions')
  async getInteraction(@Body() body: { payload: string }): Promise<any> {
    const bodyPayload = JSON.parse(body.payload);
    const userTimezoneDetails = await this.getUserTimezoneDetails(
      bodyPayload.user.id,
    );

    const external_id = bodyPayload.view.id;
    if (bodyPayload.type === 'view_closed') {
      if (bodyPayload.is_cleared) {
        delete this.viewStates[external_id];
      } else if (
        this.viewStates[external_id] === ReserveState.RESERVING_VEHICLE
      ) {
        this.viewStates[external_id] = ReserveState.FINDING_VEHICLE;
      } else {
        delete this.viewStates[external_id];
      }
    }
    if (bodyPayload.type === 'view_submission') {
      switch (this.viewStates[external_id]) {
        case ReserveState.RESERVING_VEHICLE: {
        }
        case ReserveState.FINDING_VEHICLE:
        default: {
          const { errors, vehicleAvailabilities } =
            await this.getReservableOrErrors(
              bodyPayload,
              userTimezoneDetails.offset,
            );
          if (errors) {
            return {
              response_action: 'update',
              view: JSON.stringify({
                external_id,
                ...FreeVehicleQueryBlocks({
                  vehicleTypes: await this.vehicleService.allVehicleTypes(),
                  error: errors.map((x) => `* ${x}`).join('\n'),
                }),
              }),
            };
          }
          this.viewStates[external_id] = ReserveState.RESERVING_VEHICLE;
          return {
            response_action: 'push',
            view: JSON.stringify({
              external_id,
              notify_on_close: true,
              ...ReserveVehicleBlock({
                vehicleAvailabilities,
                userTimezone: userTimezoneDetails.name,
              }),
            }),
          };
        }
      }
    }
  }

  @Post('/api/slack/reserve')
  async makeReserve(@Body() req): Promise<string> {
    const external_id = uuidv4();
    axios
      .post(
        'https://slack.com/api/views.open',
        {
          trigger_id: req.trigger_id,
          view: JSON.stringify({
            external_id,
            notify_on_close: true,
            ...FreeVehicleQueryBlocks({
              vehicleTypes: await this.vehicleService.allVehicleTypes(),
              userTimeNow: toTimeZone(
                new Date(),
                (await this.getUserTimezoneDetails(req.user_id)).name,
              ),
            }),
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(() => {
        this.viewStates[external_id] = ReserveState.FINDING_VEHICLE;
      });
    return 'Please fill out the form';
  }
}
