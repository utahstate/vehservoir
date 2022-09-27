import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleType } from 'src/entities/vehicle_type';
import { clockString } from 'src/utils/dates';

const DEFAULT_RESERVATION_PERIOD_HRS = 2;
const DEFAULT_RESERVATION_PERIOD_LENGTH_HRS = Array(10)
  .fill(0)
  .map((_, i) => (i + 1) / 2)
  .map((x) => x.toFixed(2)); // Values by half an hour between 0.5 and 5

interface FreeVehicleQueryBlocksProps {
  vehicleTypes: VehicleType[];
  userTimeNow?: Date;
  error?: string;
}

export const FreeVehicleQueryBlocks = (props: FreeVehicleQueryBlocksProps) => {
  return Modal({
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
        ((x) => (props.userTimeNow ? x.initialDate(props.userTimeNow) : x))(
          Elements.DatePicker({
            actionId: 'startDate',
          }),
        ),
      ),
      Blocks.Input({
        label: 'Available Start Time',
        blockId: 'startTime',
      }).element(
        ((x) =>
          props.userTimeNow
            ? x.initialTime(
                clockString(
                  props.userTimeNow.getHours(),
                  props.userTimeNow.getMinutes(),
                ),
              )
            : x)(
          Elements.TimePicker({
            actionId: 'startTime',
          }),
        ),
      ),
      Blocks.Input({
        label: 'Available End Date',
        blockId: 'endDate',
      }).element(
        ((x) =>
          props.userTimeNow
            ? x.initialDate(
                props.userTimeNow.getHours() + DEFAULT_RESERVATION_PERIOD_HRS >=
                  24
                  ? new Date(
                      props.userTimeNow.setDate(
                        props.userTimeNow.getDate() +
                          Math.floor(
                            (props.userTimeNow.getHours() +
                              DEFAULT_RESERVATION_PERIOD_HRS) /
                              24,
                          ),
                      ),
                    )
                  : props.userTimeNow,
              )
            : x)(
          Elements.DatePicker({
            actionId: 'endDate',
          }),
        ),
      ),
      Blocks.Input({
        label: 'Available End Time',
        blockId: 'endTime',
      }).element(
        ((x) =>
          props.userTimeNow
            ? x.initialTime(
                clockString(
                  (props.userTimeNow.getHours() +
                    DEFAULT_RESERVATION_PERIOD_HRS) %
                    24,
                  props.userTimeNow.getMinutes(),
                ),
              )
            : x)(
          Elements.TimePicker({
            actionId: 'endTime',
          }),
        ),
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
            text: `⚠️ \`\`\`${props.error}\`\`\` ⚠️`,
          })
        : null,
    )
    .buildToObject();
};
