import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reservation } from "../../entities/reservation";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>
  ) {}

  // @GET
  async allReservations(): Promise<Reservation[]> {
    return await this.reservationRepo.find();
  }

  async findOne(options: Record<string, any>) {
    return await this.reservationRepo.findOne({
      where: options,
      relations: {
        vehicle: true,
      },
    });
  }

  // @POST
  async save(reservation: Reservation): Promise<Reservation> {
    return this.reservationRepo.save(reservation);
  }

  // @DELETE
  async remove(id: number): Promise<void> {
    await this.reservationRepo.delete(id);
  }
}
