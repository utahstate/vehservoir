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
    /* TODO CHECK IF VEHICLE IS AVAILABLE AT THE TIME REQUESTED
    (COMPLICATED QUERY YOU WERE TALKING ABOUT) */

    let reservation = await this.reservationService.findOne({
      vehicle: {
        id: reservationPayload.vehicle_id,
      },
    });

    if (reservation) {
      throw new HttpException(
        `Vehicle is already requested at that time.`,
        HttpStatus.BAD_REQUEST
      );
    } else {
      /* TODO ASSIGN REQUEST ID ONCE IT EXISTS 
    (ALSO UNCOMMENT DTO) */

      let newReservation = new Reservation();
      newReservation.start = new Date(reservationPayload.start);
      newReservation.end = new Date(reservationPayload.end);

      return await this.reservationService.save(newReservation);
    }
  }

  @Delete("/api/reservations/:id")
  async remove(@Param("id") id: number): Promise<void> {
    return await this.reservationService.remove(id);
  }
}
