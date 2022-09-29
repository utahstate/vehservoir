import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Reservation } from 'src/entities/reservation';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
  ) {}

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
