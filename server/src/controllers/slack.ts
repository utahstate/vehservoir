import { Body, Controller, Post } from '@nestjs/common';
import { ReservationService } from 'src/services/reservation';
import { VehicleService } from 'src/services/vehicle';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Bits, Blocks, Elements, Modal } from 'slack-block-builder';

const DEFAULT_RESERVATION_PERIOD_HRS = 2;
const DEFAULT_RESERVATION_PERIOD_LENGTH_HRS = Array(10)
  .fill(0)
  .map((_, i) => (i + 1) / 2)
  .map((x) => x.toFixed(2)); // Values by half an hour between 0.5 and 5

@Controller()
export class SlackController {
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
    private configService: ConfigService,
  ) {}

  @Post('/api/slack/interactions')
  async getInteraction(@Body() req): Promise<string> {
    console.log(JSON.parse(req.payload));
    console.log(JSON.parse(req.payload).view.state);
    return 'Please fill out the form';
  }

  @Post('/api/slack/reserve')
  async makeReserve(@Body() req): Promise<string> {
    console.log(req);
    const callback_id = uuidv4();
    axios.post(
      'https://slack.com/api/views.open',
      {
        trigger_id: req.trigger_id,
        callback_id,
        view: Modal({
          title: 'Reserve Vehicle',
          submit: 'Find Available Vehicles',
        })
          .blocks(
            Blocks.Input({
              label: 'Vehicle Type',
              blockId: 'type',
            }).element(
              Elements.StaticSelect({
                placeholder: 'Choose a vehicle type...',
                actionId: 'type',
              }).options(
                (await this.vehicleService.allVehicleTypes()).map((type) =>
                  Bits.Option({
                    text: type.name,
                    value: type.id.toString(),
                  }),
                ),
              ),
            ),
            Blocks.Input({
              label: 'Available Start Date',
              blockId: 'start-date',
            }).element(
              Elements.DatePicker({
                actionId: 'start-date',
                initialDate: new Date(),
              }),
            ),
            Blocks.Input({
              label: 'Available Start Time',
              blockId: 'start-time',
            }).element(
              Elements.TimePicker({
                actionId: 'start-time',
                initialTime: ((date) =>
                  `${date.getHours()}:${date.getMinutes()}`)(new Date()),
              }),
            ),
            Blocks.Input({
              label: 'Available End Date',
              blockId: 'end-date',
            }).element(
              Elements.DatePicker({
                actionId: 'end-date',
                initialDate: ((date) =>
                  date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS > 24
                    ? new Date(
                        date.setDate(
                          date.getDate() +
                            Math.floor(
                              (date.getHours() +
                                DEFAULT_RESERVATION_PERIOD_HRS) /
                                24,
                            ),
                        ),
                      )
                    : date)(new Date()),
              }),
            ),
            Blocks.Input({
              label: 'Available End Time',
              blockId: 'end-time',
            }).element(
              Elements.TimePicker({
                actionId: 'end-time',
                initialTime: ((date) =>
                  ((date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS) % 24) +
                  ':' +
                  date.getMinutes())(new Date()),
              }),
            ),
            Blocks.Input({
              label: 'Reservation Length (Hours)',
              blockId: 'reservation-period',
            }).element(
              Elements.StaticSelect({
                placeholder: 'Reservation length in hours...',
                actionId: 'reservation-period',
              }).options(
                DEFAULT_RESERVATION_PERIOD_LENGTH_HRS.map((x) =>
                  Bits.Option({
                    text: x,
                    value: x,
                  }),
                ),
              ),
            ),
          )
          .buildToJSON(),
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
