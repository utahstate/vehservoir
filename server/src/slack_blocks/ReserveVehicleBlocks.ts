import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleAvailability } from 'src/services/vehicle';
import { seperateDateRange } from 'src/utils/dates';

interface ReserveVehicleBlockProps {
  vehicleAvailabilities: VehicleAvailability[];
  periodSeconds: number;
  userTimezone: string;
}

const DEFAULT_SEPERATION_SECONDS = 15 * 60;
const MAX_OPTIONS = 50;

export const ReserveVehicleBlock = (props: ReserveVehicleBlockProps) => {
  let totalOptions = 0;

  const optionGroups = [];

  for (const vehicleAvailability of props.vehicleAvailabilities) {
    if (totalOptions >= MAX_OPTIONS) {
      break;
    }
    optionGroups.push(
      Bits.OptionGroup({
        label: vehicleAvailability.vehicle.name,
      }).options(
        vehicleAvailability.availability
          .map((dateRange) =>
            seperateDateRange(
              dateRange,
              props.periodSeconds,
              Math.min(props.periodSeconds, DEFAULT_SEPERATION_SECONDS),
            ).filter(() => ++totalOptions <= MAX_OPTIONS),
          )
          .filter((x) => x.length)
          .flat()
          .map((timeRange) =>
            Bits.Option({
              text: timeRange
                .map((date) =>
                  date.toLocaleString('en-US', {
                    timeZone: props.userTimezone,
                  }),
                )
                .join(' - '),
              value: JSON.stringify({
                vehicleId: vehicleAvailability.vehicle.id,
                timeRange,
              }),
            }),
          ),
      ),
    );
  }

  return Modal({
    title: 'Reserve Vehicle',
    submit: 'Make Reservation',
  })
    .blocks(
      Blocks.Input({
        label: 'Reservation',
        blockId: 'reservation',
      }).element(
        Elements.StaticSelect({
          placeholder: 'Choose a reservation',
          actionId: 'reservation',
        }).optionGroups(optionGroups),
      ),
    )
    .buildToObject();
};
