import {
  Modal,
  Blocks,
  Elements,
  Bits,
  setIfTruthy,
} from 'slack-block-builder';
import { VehicleType } from 'src/entities/vehicle_type';

const DEFAULT_RESERVATION_PERIOD_HRS = 2;
const DEFAULT_RESERVATION_PERIOD_LENGTH_HRS = Array(10)
  .fill(0)
  .map((_, i) => (i + 1) / 2)
  .map((x) => x.toFixed(2)); // Values by half an hour between 0.5 and 5

const clockString = (hours: number, minutes: number) =>
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

interface FreeVehicleQueryBlocksProps {
  vehicleTypes: VehicleType[];
  error?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  type?: { value: string; text: string };
  reservationPeriod?: { value: string; text: string };
}

export const FreeVehicleQueryBlocks = (props: FreeVehicleQueryBlocksProps) =>
  Modal({
    title: 'Reserve Vehicle',
    submit: 'Find Available Vehicles',
  })
    .blocks(
      props.error
        ? Blocks.Section({
            text: `⚠️ \`${props.error}\` ⚠️`,
          })
        : null,
      Blocks.Input({
        label: 'Vehicle Type',
        blockId: 'type',
      }).element(
        Elements.StaticSelect({
          placeholder: 'Choose a vehicle type...',
          actionId: 'type',
        })
          .options(
            props.vehicleTypes.map((type) =>
              Bits.Option({
                text: type.name,
                value: type.id.toString(),
              }),
            ),
          )
          .initialOption(setIfTruthy(props.type, Bits.Option(props.type))),
      ),
      Blocks.Input({
        label: 'Available Start Date',
        blockId: 'startDate',
      }).element(
        Elements.DatePicker({
          actionId: 'startDate',
          initialDate:
            (props.startDate && new Date(props.startDate)) || new Date(),
        }),
      ),
      Blocks.Input({
        label: 'Available Start Time',
        blockId: 'startTime',
      }).element(
        Elements.TimePicker({
          actionId: 'startTime',
          initialTime:
            props.startTime ||
            ((date) => clockString(date.getHours(), date.getMinutes()))(
              new Date(),
            ),
        }),
      ),
      Blocks.Input({
        label: 'Available End Date',
        blockId: 'endDate',
      }).element(
        Elements.DatePicker({
          actionId: 'endDate',
          initialDate: ((date) =>
            date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS > 24
              ? new Date(
                  date.setDate(
                    date.getDate() +
                      Math.floor(
                        (date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS) / 24,
                      ),
                  ),
                )
              : date)(new Date()),
        }),
      ),
      Blocks.Input({
        label: 'Available End Time',
        blockId: 'endTime',
      }).element(
        Elements.TimePicker({
          actionId: 'endTime',
          initialTime:
            props.endTime ||
            ((date) =>
              clockString(
                (date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS) % 24,
                date.getMinutes(),
              ))(new Date()),
        }),
      ),
      Blocks.Input({
        label: 'Reservation Length (Hours)',
        blockId: 'reservationPeriod',
      }).element(
        Elements.StaticSelect({
          placeholder: 'Reservation length in hours...',
          actionId: 'reservationPeriod',
        })
          .options(
            DEFAULT_RESERVATION_PERIOD_LENGTH_HRS.map((periodLength) =>
              Bits.Option({
                text: periodLength,
                value: periodLength,
              }),
            ),
          )
          .initialOption(
            setIfTruthy(
              props.reservationPeriod,
              Bits.Option(props.reservationPeriod),
            ),
          ),
      ),
    )
    .buildToJSON();
