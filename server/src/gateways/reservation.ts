import { forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Reservation } from 'src/entities/reservation';
import { ReservationService } from 'src/services/reservation';

const TIMEOUT_ENSURE_DELTA_MS = 200;

@WebSocketGateway()
export class ReservationGateway {
  constructor(
    @Inject(forwardRef(() => ReservationService))
    private reservationService: ReservationService,
  ) {}

  @WebSocketServer()
  server: Server;

  private reservationTimeouts = new Map<number, NodeJS.Timeout>();

  private async maybeRemindClientsOfReservation(reservation: Reservation) {
    const newReservation = await this.reservationService.findOne(
      {
        id: reservation.id,
      },
      { vehicle: true },
    );

    if (
      newReservation &&
      newReservation.start.getTime() <= Date.now() &&
      newReservation.end.getTime() >= Date.now()
    ) {
      this.server.emit('reservationStarted', newReservation);
      this.reservationTimeouts.set(
        reservation.id,
        setTimeout(
          () => this.maybeRemindClientsOfReservation(newReservation),
          newReservation.end.getTime() - Date.now() + TIMEOUT_ENSURE_DELTA_MS,
        ),
      );
    } else if (newReservation && newReservation.end.getTime() <= Date.now()) {
      this.server.emit('reservationEnded', newReservation);
      this.reservationTimeouts.delete(reservation.id);
    }
  }

  async handleReservationSaved(reservationPromise: Promise<Reservation>) {
    const reservation = await reservationPromise;
    if (this.reservationTimeouts.has(reservation.id)) {
      clearTimeout(this.reservationTimeouts.get(reservation.id));
    }
    this.reservationTimeouts.set(
      reservation.id,
      setTimeout(() => {
        this.maybeRemindClientsOfReservation(reservation);
      }, Math.max(0, reservation.start.getTime() - Date.now()) + TIMEOUT_ENSURE_DELTA_MS),
    );
    this.server.emit('reservationSaved', reservation);
  }

  async handleReservationDeleted(reservation: Reservation) {
    if (this.reservationTimeouts.has(reservation.id)) {
      clearTimeout(this.reservationTimeouts.get(reservation.id));
    }
    this.server.emit('reservationEnded', reservation);
    this.reservationTimeouts.delete(reservation.id);
  }
}
