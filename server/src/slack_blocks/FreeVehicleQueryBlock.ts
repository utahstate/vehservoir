import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
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
  vehicleType?: { value: string; text: string };
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reservationPeriod?: string;
}

export const FreeVehicleQueryBlocks = (props: FreeVehicleQueryBlocksProps) =>
  Modal({
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
          props.vehicleTypes.map((type) =>
            Bits.Option({
              text: type.name,
              value: type.id.toString(),
            }),
          ),
        ),
      ),
      Blocks.Input({
        label: 'Available Start Date',
        blockId: 'startDate',
      }).element(
        Elements.DatePicker({
          actionId: 'startDate',
          initialDate: new Date(),
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
          initialDate:
            (props.endDate && new Date(props.endDate)) ||
            ((date) =>
              date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS > 24
                ? new Date(
                    date.setDate(
                      date.getDate() +
                        Math.floor(
                          (date.getHours() + DEFAULT_RESERVATION_PERIOD_HRS) /
                            24,
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
        }).options(
          DEFAULT_RESERVATION_PERIOD_LENGTH_HRS.map((periodLength) =>
            Bits.Option({
              text: periodLength,
              value: periodLength,
            }),
          ),
        ),
      ),
      props.error
        ? Blocks.Section({
            text: `⚠️ \`${props.error}\` ⚠️`,
          })
        : null,
    )
    .buildToJSON();
