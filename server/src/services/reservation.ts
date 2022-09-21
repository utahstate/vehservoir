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
    return this.reservationRepo.find();
  }

  async findReservationsBy(
    options: Record<string, any>,
    relations: Record<string, boolean>,
  ): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations,
      where: options,
    });
  }

  async findOne(options: Record<string, any>): Promise<Reservation> {
    return this.reservationRepo.findOne({
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
