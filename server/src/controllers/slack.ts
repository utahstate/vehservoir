import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from 'src/services/reservation';
import { VehicleService } from 'src/services/vehicle';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FreeVehicleQueryBlocks } from 'src/slack_blocks/FreeVehicleQueryBlock';
import { Blocks, Modal } from 'slack-block-builder';

const applyTimezoneOffset = (date: Date, seconds: number) => {
  const newDate = new Date(date);
  newDate.setSeconds(newDate.getSeconds() + seconds);
  return newDate;
};

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

  private async getUserTimezoneOffset(user_id: string): Promise<number> {
    const response = await axios.get('https://slack.com/api/users.info', {
      params: {
        user: user_id,
      },
      headers: {
        Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
      },
    });
    return response.data.user.tz_offset;
  }

  private updateView(view_id: string, view: any) {
    return axios.post(
      'https://slack.com/api/views.update',
      {
        view_id,
        view,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('SLACK_TOKEN')}`,
        },
      },
    );
  }

  private async dispatchReservationUpdate(bodyPayload: any) {
    const reservationValues = bodyPayload.view.state
      .values as ReservationFindAvailableViewState;
    const userTimeZone = await this.getUserTimezoneOffset(bodyPayload.user.id);
    const startDate = applyTimezoneOffset(
      new Date(
        `${reservationValues.startDate.startDate.selected_date} ${reservationValues.startTime.startTime.selected_time}`,
      ),
      userTimeZone,
    );
    const endDate = applyTimezoneOffset(
      new Date(
        `${reservationValues.endDate.endDate.selected_date} ${reservationValues.endTime.endTime.selected_time}`,
      ),
      userTimeZone,
    );

    const freeVehicles = await this.vehicleService.vehicleFreePeriodsBy(
      {
        type: parseInt(reservationValues.type.type.selected_option.value, 10),
      },
      startDate,
      endDate,
    );
    console.log(freeVehicles);

    await this.updateView(
      bodyPayload.view.id,
      FreeVehicleQueryBlocks({
        vehicleTypes: await this.vehicleService.allVehicleTypes(),
        error: 'Could not find any free vehicles',
        startDate: reservationValues.startDate.startDate.selected_date,
        endDate: reservationValues.endDate.endDate.selected_date,
        startTime: reservationValues.startTime.startTime.selected_time,
        endTime: reservationValues.endTime.endTime.selected_time,
        type: reservationValues.type.type.selected_option,
        reservationPeriod:
          reservationValues.reservationPeriod.reservationPeriod.selected_option,
      }),
    );
  }

  @Post('/api/slack/interactions')
  async getInteraction(@Body() body: { payload: string }): Promise<any> {
    const bodyPayload = JSON.parse(body.payload);

    if (bodyPayload.type === 'view_submission') {
      this.dispatchReservationUpdate(bodyPayload);
      return {
        response_action: 'update',
        view: Modal({
          title: 'Processing',
        })
          .blocks(
            Blocks.Section({
              text: 'Processing your request...',
            }),
          )
          .buildToJSON(),
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
