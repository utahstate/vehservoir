import { forwardRef, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Reservation } from 'src/entities/reservation.entity';
import { ReservationService } from 'src/services/reservation.service';

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

  private setTimeoutForReservationInFuture(reservation: Reservation) {
    this.reservationTimeouts.set(
      reservation.id,
      setTimeout(() => {
        this.maybeRemindClientsOfReservation(reservation);
      }, Math.max(0, reservation.start.getTime() - Date.now()) + TIMEOUT_ENSURE_DELTA_MS),
    );
  }

  @Cron('*/15 * * * * *')
  private async maybeUpdateCurrentTimeouts() {
    (await this.reservationService.currentReservationsWithVehicles())
      .filter((reservation) => !this.reservationTimeouts.has(reservation.id))
      .map((reservation) => this.setTimeoutForReservationInFuture(reservation));
  }

  private async maybeRemindClientsOfReservation(reservation: Reservation) {
    const updatedReservation = await this.reservationService.findOne(
      {
        id: reservation.id,
      },
      { vehicle: true },
    );

    if (
      updatedReservation &&
      updatedReservation.start.getTime() <= Date.now() &&
      updatedReservation.end.getTime() >= Date.now()
    ) {
      this.server.emit('reservationStarted', updatedReservation);
      this.setTimeoutForReservationInFuture(updatedReservation);
    } else if (
      updatedReservation &&
      updatedReservation.end.getTime() <= Date.now()
    ) {
      this.server.emit('reservationEnded', updatedReservation);
      this.reservationTimeouts.delete(reservation.id);
    }
  }

  async handleReservationSaved(reservationPromise: Promise<Reservation>) {
    const reservation = await reservationPromise;
    if (this.reservationTimeouts.has(reservation.id)) {
      clearTimeout(this.reservationTimeouts.get(reservation.id));
    }
    this.setTimeoutForReservationInFuture(reservation);
    this.server.emit('reservationSaved', reservation);
  }

  async handleReservationDeleted(reservation: Reservation) {
    if (this.reservationTimeouts.has(reservation.id)) {
      clearTimeout(this.reservationTimeouts.get(reservation.id));
    }
    this.server.emit('reservationDeleted', reservation);
    this.reservationTimeouts.delete(reservation.id);
  }
}
