import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { ReservationService } from "../providers/services/reservation";
import { Reservation } from "../entities/reservation";
import type { ReservationCreationDto } from "../../dto/reservations/Creation";
import { DeleteResult } from "typeorm";

@Controller()
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get("/api/reservations")
  async index(): Promise<Reservation[]> {
    return await this.reservationService.allReservations();
  }

  @Post("/api/reservations")
  async createReservation(
    @Body() reservationPayload: ReservationCreationDto
  ): Promise<Reservation> {
    // Start & end
    /// r1 = [0, 10], r2 = [12, 20]
    // a = [5, 10]
    // for i in r1.filter(x => a[0] < x[1] && a[1] > x[0]):
    //   if min(a[1], i[1]) - max(a[0], i[0]) > 0:
    //     return False

    const newReservation = new Reservation();
    newReservation.start = new Date(reservationPayload.start);
    newReservation.end = new Date(reservationPayload.end);

    return await this.reservationService.save(newReservation);
  }

  @Delete("/api/reservations/:id")
  async remove(@Param("id") id: number): Promise<DeleteResult> {
    return await this.reservationService.remove(id);
  }
}
