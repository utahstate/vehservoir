import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { VehicleType } from 'src/entities/vehicle_type.entity';
import { applyTimezoneOffset, clockString, toTimeZone } from 'src/utils/dates';

const DEFAULT_RESERVATION_PERIOD_HRS = 2;
const DEFAULT_RESERVATION_PERIOD_LENGTH_HRS = Array(10)
  .fill(0)
  .map((_, i) => (i + 1) / 2); // Values by half an hour between 0.5 and 5

interface FreeVehicleQueryBlocksProps {
  user: {
    tz: string;
    tz_offset: number;
  };
  params: {
    advanced: boolean;
    vehicleTypes: VehicleType[];
    selectedVehicleType?: VehicleType;
    error?: string;
  };
}

export const FreeVehicleQueryBlocks = ({
  user,
  params,
}: FreeVehicleQueryBlocksProps) => {
  const userTimeNow = toTimeZone(new Date(), user.tz);
  return Modal({
    title: 'Reserve a Vehicle',
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
        })
          .options(
            params.vehicleTypes.map((type) =>
              Bits.Option({
                text: type.name,
                value: type.id.toString(),
              }),
            ),
          )
          .initialOption(
            Bits.Option({
              text: (params.selectedVehicleType || params.vehicleTypes[0]).name,
              value: (
                params.selectedVehicleType || params.vehicleTypes[0]
              ).id.toString(),
            }),
          ),
      ),
      Blocks.Input({
        label: `${params.advanced ? 'Search Available' : ''} Start Date`,
        blockId: 'startDate',
      }).element(
        ((x) =>
          userTimeNow
            ? x.initialDate(applyTimezoneOffset(userTimeNow, -user.tz_offset))
            : x)(
          Elements.DatePicker({
            actionId: 'startDate',
          }),
        ),
      ),
      Blocks.Input({
        label: `${params.advanced ? 'Search Available ' : ''} Start Time`,
        blockId: 'startTime',
      }).element(
        ((x) =>
          userTimeNow
            ? x.initialTime(
                clockString(userTimeNow.getHours(), userTimeNow.getMinutes()),
              )
            : x)(
          Elements.TimePicker({
            actionId: 'startTime',
          }),
        ),
      ),
      Blocks.Input({
        label: `${params.advanced ? 'Search Available ' : ''} End Date`,
        blockId: 'endDate',
      }).element(
        ((x) =>
          userTimeNow
            ? x.initialDate(
                applyTimezoneOffset(
                  userTimeNow.getHours() + DEFAULT_RESERVATION_PERIOD_HRS >= 24
                    ? new Date(
                        userTimeNow.setDate(
                          userTimeNow.getDate() +
                            Math.floor(
                              (userTimeNow.getHours() +
                                DEFAULT_RESERVATION_PERIOD_HRS) /
                                24,
                            ),
                        ),
                      )
                    : userTimeNow,
                  -user.tz_offset,
                ),
              )
            : x)(
          Elements.DatePicker({
            actionId: 'endDate',
          }),
        ),
      ),
      Blocks.Input({
        label: `${params.advanced ? 'Search Available ' : ''}End Time`,
        blockId: 'endTime',
      }).element(
        ((x) =>
          userTimeNow
            ? x.initialTime(
                clockString(
                  (userTimeNow.getHours() + DEFAULT_RESERVATION_PERIOD_HRS) %
                    24,
                  userTimeNow.getMinutes(),
                ),
              )
            : x)(
          Elements.TimePicker({
            actionId: 'endTime',
          }),
        ),
      ),
      params.advanced
        ? Blocks.Input({
            label: 'Reservation Length (Hours)',
            blockId: 'reservationPeriod',
          }).element(
            Elements.StaticSelect({
              placeholder: 'Reservation length in hours...',
              actionId: 'reservationPeriod',
            }).options(
              DEFAULT_RESERVATION_PERIOD_LENGTH_HRS.map((periodHourLength) =>
                Bits.Option({
                  text: periodHourLength.toFixed(2),
                  value: (periodHourLength * 60 * 60).toString(10),
                }),
              ),
            ),
          )
        : null,
      params.error
        ? Blocks.Section({
            text: `⚠️ \`\`\`${params.error}\`\`\` ⚠️`,
          })
        : null,
    )
    .buildToObject();
};
