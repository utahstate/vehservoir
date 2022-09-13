import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Reservation } from "../../entities/reservation";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>
  ) {}

  async findReservationsBy(
    options: Record<string, any>,
    relations: Record<string, Boolean>
  ): Promise<Reservation[]> {
    return this.reservationRepo.find({
      relations,
      where: options,
    });
  }

  async findOne(options: Record<string, any>): Promise<Reservation | null> {
    return this.reservationRepo.findOne({
      where: options,
    });
  }

  async save(reservation: Reservation): Promise<Reservation> {
    return this.reservationRepo.save(reservation);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.reservationRepo.delete(id);
  }
}