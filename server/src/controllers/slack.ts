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

@Controller()
export class SlackController {
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
    private configService: ConfigService,
  ) {}

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
        `${reservationValues.startDate.startDate.selected_date} ${reservationValues.startTime.startTime.selected_time}`,
      ),
      userTimezoneOffset,
    );
    const endDate = applyTimezoneOffset(
      new Date(
        `${reservationValues.endDate.endDate.selected_date} ${reservationValues.endTime.endTime.selected_time}`,
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
      await this.vehicleService.vehicleFreePeriodsBy(
        {
          type: parseInt(reservationValues.type.type.selected_option.value, 10),
        },
        startDate,
        endDate,
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

    if (bodyPayload.type === 'view_submission') {
      const { errors, vehicleAvailabilities } =
        await this.getReservableOrErrors(
          bodyPayload,
          userTimezoneDetails.offset,
        );
      if (errors) {
        console.log(errors);
        return {
          response_action: 'update',
          view: FreeVehicleQueryBlocks({
            vehicleTypes: await this.vehicleService.allVehicleTypes(),
            error: errors.map((x) => `* ${x}`).join('\n'),
          }),
        };
      }
      const view = ReserveVehicleBlock({
        vehicleAvailabilities,
        userTimezoneOffset: userTimezoneDetails.offset,
      });
      return {
        response_action: 'push',
        view,
      };
    }
    return { text: 'ok, got that' };
  }

  @Post('/api/slack/reserve')
  async makeReserve(@Body() req): Promise<string> {
    const callback_id = uuidv4();
    axios.post(
      'https://slack.com/api/views.open',
      {
        trigger_id: req.trigger_id,
        callback_id,
        view: FreeVehicleQueryBlocks({
          vehicleTypes: await this.vehicleService.allVehicleTypes(),
          userTimeNow: toTimeZone(
            new Date(),
            (await this.getUserTimezoneDetails(req.user_id)).name,
          ),
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
