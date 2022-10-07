import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleAvailability } from 'src/services/vehicle.service';
import { seperateDateRange } from 'src/utils/dates';

interface ReserveVehicleBlockProps {
  params: {
    vehicleAvailabilities: VehicleAvailability[];
    periodSeconds: number;
    error: string;
  };
  user: {
    tz: string;
  };
}

const DEFAULT_SEPERATION_SECONDS = 15 * 60;
const MAX_OPTIONS = 50;

export const ReserveVehicleBlock = ({
  params,
  user,
}: ReserveVehicleBlockProps) => {
  let totalOptions = 0;

  const optionGroups = [];

  for (const vehicleAvailability of params.vehicleAvailabilities) {
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
              params.periodSeconds,
              Math.min(params.periodSeconds, DEFAULT_SEPERATION_SECONDS),
            ).filter(() => ++totalOptions <= MAX_OPTIONS),
          )
          .filter((x) => x.length)
          .flat()
          .map((timeRange) =>
            Bits.Option({
              text: timeRange
                .map((date) =>
                  date.toLocaleString('en-US', {
                    timeZone: user.tz,
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
      params.error
        ? Blocks.Section({
            text: `⚠️ \`\`\`${params.error}\`\`\` ⚠️`,
          })
        : null,
    )
    .buildToObject();
};
