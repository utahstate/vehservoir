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
import { Reservation } from 'src/entities/reservation';
import { SlackRequestService } from 'src/services/slack_request';
import { MoreThanOrEqual } from 'typeorm';
import { UnreserveBlocks } from 'src/slack_blocks/UnreserveBlocks';

const formatErrors = (errors) => errors.map((x) => `* ${x}`).join('\n');

export interface UnreserveViewState {
  reservations: {
    reservations: {
      type: 'checkboxes';
      selected_options: {
        text: any;
        value: string;
      }[];
    };
  };
}

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
  UNRESERVING_VEHICLE,
}

export interface ViewState {
  modal: ReserveModal;
  params: any;
  user: SlackUser;
}

export interface SlackUser {
  id: string;
  real_name: string;
  tz_offset: number;
  tz: string;
}

@Controller()
export class SlackController {
  private viewStates: Record<string, ViewState>; // Preserves Slack modal state per view in memory
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
    private configService: ConfigService,
    private slackRequestService: SlackRequestService,
  ) {
    this.viewStates = {};
  }

  @Post('/api/slack/reservations')
  async userReservationsCommand(@Body() req): Promise<string> {
    const user = await this.getUserDetails(req.user_id);

    const { reservations, errors } =
      await this.getUserCurrentReservationsOrErrors(user);
    if (errors) {
      return '```' + formatErrors(errors) + '```';
    }

    return (
      '```' +
      'Your reservations:\n' +
      reservations
        .sort((a, b) => b.start.getTime() - a.start.getTime())
        .map(
          (reservation) =>
            reservation.vehicle.name +
            ' | ' +
            [reservation.start, reservation.end]
              .map((date) =>
                date.toLocaleString('en-US', { timeZone: user.tz }),
              )
              .join(' - '),
        )
        .join('\n') +
      '```'
    );
  }

  @Post('/api/slack/unreserve')
  async unreserveCommand(@Body() req): Promise<string> {
    const external_id = uuidv4();

    const user = await this.getUserDetails(req.user_id);

    const { reservations, errors } =
      await this.getUserCurrentReservationsOrErrors(user);
    if (errors) {
      return '`' + formatErrors(errors) + '`';
    }

    this.viewStates[external_id] = {
      modal: ReserveModal.UNRESERVING_VEHICLE,
      params: {
        reservations,
      },
      user,
    };

    axios.post(
      'https://slack.com/api/views.open',
      {
        trigger_id: req.trigger_id,
        view: JSON.stringify({
          external_id,
          notify_on_close: true,
          ...UnreserveBlocks(this.viewStates[external_id]),
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

  @Post('/api/slack/reserve')
  async reserveCommand(@Body() req): Promise<string> {
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

  @Post('/api/slack/interactions')
  async getInteraction(@Body() body: { payload: string }): Promise<any> {
    const bodyPayload = JSON.parse(body.payload);
    const oldExternalId = bodyPayload.view.external_id;

    if (bodyPayload.type === 'view_closed' && bodyPayload.is_cleared) {
      delete this.viewStates[oldExternalId];
    }

    if (bodyPayload.type === 'view_submission') {
      const external_id = uuidv4();
      const oldState = this.viewStates[oldExternalId];
      this.viewStates[external_id] = { ...oldState };
      const user = this.viewStates[external_id].user;
      delete this.viewStates[oldExternalId];

      if (
        this.viewStates[external_id].modal === ReserveModal.RESERVING_VEHICLE
      ) {
        const { reservation, errors } = await this.makeReservationOrErrors(
          bodyPayload,
          this.viewStates[external_id].user,
        );
        if (!errors && reservation) {
          this.sendUserMessage(
            user,
            `Thanks, ${user.real_name}! We have confirmed your ${
              reservation.vehicle.name
            }, ${(
              (reservation.end.getTime() - reservation.start.getTime()) /
              (60 * 60 * 1000)
            ).toFixed(2)} hour reservation, starting at ${toTimeZone(
              reservation.start,
              user.tz,
            ).toLocaleString()}`,
          );
          delete this.viewStates[oldExternalId];
          return {
            response_action: 'clear',
          };
        }
        this.viewStates[external_id].params.error = formatErrors(errors);
        return {
          response_action: 'update',
          view: JSON.stringify({
            external_id,
            notify_on_close: true,
            ...ReserveVehicleBlock(this.viewStates[external_id]),
          }),
        };
      } else if (
        this.viewStates[external_id].modal === ReserveModal.FINDING_VEHICLE
      ) {
        const { errors, periodSeconds, vehicleAvailabilities } =
          await this.getReservableOrErrors(
            bodyPayload,
            this.viewStates[external_id].user.tz_offset,
          );

        if (errors) {
          this.viewStates[external_id].modal = ReserveModal.FINDING_VEHICLE;
          this.viewStates[external_id].params.error = formatErrors(errors);
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
          response_action: 'update',
          view: JSON.stringify({
            external_id,
            notify_on_close: true,
            ...ReserveVehicleBlock(this.viewStates[external_id]),
          }),
        };
      } else if (
        this.viewStates[external_id].modal === ReserveModal.UNRESERVING_VEHICLE
      ) {
        const { errors } = await this.removeReservationsAndGetErrors(
          bodyPayload,
          user,
        );

        if (errors) {
          this.viewStates[external_id].params.error = formatErrors(errors);
          return {
            response_action: 'update',
            view: JSON.stringify({
              external_id,
              notify_on_close: true,
              ...UnreserveBlocks(this.viewStates[external_id]),
            }),
          };
        }
        delete this.viewStates[external_id];
        return {
          response_action: 'clear',
        };
      }
    }
  }

  private async sendUserMessage(user: SlackUser, text: string) {
    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: user.id,
        text,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
        },
      },
    );
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

  private async getUserCurrentReservationsOrErrors(user: SlackUser) {
    const reservations = await this.reservationService.findReservationsBy(
      {
        end: MoreThanOrEqual(new Date()),
        request: {
          slackUserId: user.id,
        },
      },
      { request: true, vehicle: true },
    );

    if (!reservations.length) {
      return {
        errors: [
          'You have no future or current reservations. Use /reserve to make one!',
        ],
      };
    }

    return { reservations };
  }

  private async removeReservationsAndGetErrors(
    bodyPayload: any,
    user: SlackUser,
  ) {
    const unreserveValues = bodyPayload.view.state.values as UnreserveViewState;
    const errors = [];
    await Promise.all(
      unreserveValues.reservations.reservations.selected_options.map(
        async ({ value: reservationId }) =>
          this.reservationService
            .findOne(
              {
                id: reservationId,
              },
              { request: true },
            )
            .then((reservation) => {
              if (!reservation) {
                errors.push(
                  `Could not find reservation with id ${reservationId}`,
                );
                return;
              }
              if (reservation.request?.slackUserId === user.id) {
                return this.reservationService.remove(reservation);
              }
              errors.push(`${reservationId} does not belong to ${user.id}`);
            }),
      ),
    );
    return { errors };
  }

  private async makeReservationOrErrors(bodyPayload: any, user: SlackUser) {
    const reservationValues = bodyPayload.view.state
      .values as ReservationRequestViewState;
    const {
      vehicleId,
      timeRange: [start, end],
    } = ((x) => ({
      vehicleId: parseInt(x.vehicleId),
      timeRange: x.timeRange.map((d: string) => new Date(d)),
    }))(
      JSON.parse(
        reservationValues.reservation.reservation.selected_option.value,
      ),
    );

    const vehicle = await this.vehicleService.findVehicleBy({ id: vehicleId });

    const request = await this.slackRequestService.save({
      slackUserId: user.id,
      userName: user.real_name,
    });

    if (!request) {
      return {
        errors: ['Could not make request. Try again.'],
      };
    }

    // Since we verify the request is from slack via the secret signing token,
    // we know the request was validated against the Free DTO - no need for a
    // second validation on the reservation here
    const reservation = new Reservation();
    reservation.vehicle = vehicle;
    reservation.start = start;
    reservation.end = end;
    reservation.request = request;

    if (await this.vehicleService.vehicleAvailable(vehicle, start, end)) {
      return {
        reservation: await this.reservationService.save(reservation),
      };
    }
    return {
      errors: [
        'Reservation is no longer available; try another or make a new reservation request',
      ],
    };
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

    if (!vehicleAvailabilities.length) {
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
}
