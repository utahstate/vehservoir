import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, LessThanOrEqual, Repository } from 'typeorm';
import { Reservation } from 'src/entities/reservation';
import { Cron } from '@nestjs/schedule';

const EXPIRED_RESERVATION_THRESHOLD_SEC = 60 * 60 * 24 * 20; // Twenty days

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
  ) {}

  @Cron('0 0 * * * *')
  async removeExpiredReservations() {
    const expiredDate = new Date(
      new Date().setSeconds(-EXPIRED_RESERVATION_THRESHOLD_SEC),
    );
    const expiredReservations = await this.findReservationsBy(
      {
        end: LessThanOrEqual(expiredDate),
      },
      {},
    );
    expiredReservations.map((reservation) => {
      this.remove(reservation).then((x) =>
        console.log(
          `Reservation ${x} age was greater than ${expiredDate.toLocaleString()} and removed`,
        ),
      );
    });
  }

  async allReservations(): Promise<Reservation[]> {
    return this.reservationRepo.find({
      order: {
        id: 'desc',
      },
    });
  }

  async findReservationsBy(
    options: Record<string, any>,
    relations: Record<string, boolean>,
  ): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations,
      where: options,
      order: {
        id: 'desc',
      },
    });
  }

  async findOne(
    options: Record<string, any>,
    relations: Record<string, boolean> = null,
  ): Promise<Reservation> {
    return this.reservationRepo.findOne({
      relations,
      where: options,
    });
  }

  async save(reservation: Reservation): Promise<Reservation> {
    return this.reservationRepo.save(reservation);
  }

  async remove(reservation: Reservation): Promise<DeleteResult> {
    return this.reservationRepo.delete(reservation);
  }
}
