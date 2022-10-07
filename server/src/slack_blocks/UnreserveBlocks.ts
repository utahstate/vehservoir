import { Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { formatReservation } from 'src/controllers/slack.controller';

import { Reservation } from 'src/entities/reservation.entity';

interface ReservationsBlocksProps {
  params: {
    reservations: Reservation[];
    error?: string;
  };
  user: {
    tz: string;
  };
}

export const UnreserveBlocks = ({ params, user }: ReservationsBlocksProps) => {
  return Modal({
    title: 'Unreserve Reservation',
    submit: 'Unreserve',
  })
    .blocks(
      Blocks.Input({
        blockId: 'reservations',
        label: 'My Reservations',
      }).element(
        Elements.Checkboxes({
          actionId: 'reservations',
        }).options(
          params.reservations
            .sort((a, b) => b.start.getTime() - a.start.getTime())
            .map((reservation) =>
              Bits.Option({
                text: formatReservation(reservation, user.tz),
                value: reservation.id.toString(),
              }),
            ),
        ),
      ),

      params.error
        ? Blocks.Section({
            text: `⚠️ \`\`\`${params.error}\`\`\` ⚠️`,
          })
        : null,
    )
    .buildToObject();
};
