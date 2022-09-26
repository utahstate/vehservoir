import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleAvailability } from 'src/services/vehicle';
import { applyTimezoneOffset, toTimeZone } from 'src/utils/dates';

interface ReserveVehicleBlockProps {
  vehicleAvailabilities: Map<number, VehicleAvailability>;
  userTimezoneOffset: number;
}

export const ReserveVehicleBlock = (props: ReserveVehicleBlockProps) => {
  console.log(props.vehicleAvailabilities);
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
            ([vehicleId, vehicleAvailability]) => {
              console.log(vehicleId, vehicleAvailability);
              return Bits.OptionGroup({
                label: vehicleAvailability.vehicle.name,
              }).options(
                vehicleAvailability.availability.map(
                  (timeRange: [Date, Date]) =>
                    Bits.Option({
                      text: timeRange
                        .map((date) =>
                          applyTimezoneOffset(
                            date,
                            -props.userTimezoneOffset, // Go back from UTC
                          ).toLocaleString(),
                        )
                        .join(' - '),
                      value: JSON.stringify(timeRange),
                    }),
                ),
              );
            },
          ),
        ),
      ),
    )
    .buildToJSON();
};
