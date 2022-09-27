import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleAvailability } from 'src/services/vehicle';

interface ReserveVehicleBlockProps {
  vehicleAvailabilities: VehicleAvailability[];
  userTimezone: string;
}

export const ReserveVehicleBlock = (props: ReserveVehicleBlockProps) => {
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
        }).optionGroups(
          Array.from(props.vehicleAvailabilities).map(
            ({ vehicle, availability }) => {
              return Bits.OptionGroup({
                label: vehicle.name,
              }).options(
                availability.map((timeRange: [Date, Date]) =>
                  Bits.Option({
                    text: timeRange
                      .map((date) =>
                        date.toLocaleString('en-US', {
                          timeZone: props.userTimezone,
                        }),
                      )
                      .join(' - '),
                    value: JSON.stringify({ vehicleId: vehicle.id, timeRange }),
                  }),
                ),
              );
            },
          ),
        ),
      ),
    )
    .buildToObject();
};
