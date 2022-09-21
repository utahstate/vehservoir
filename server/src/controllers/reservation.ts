import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReservationService } from 'src/services/reservation';
import { Reservation } from 'src/entities/reservation';
import { ReservationDto } from 'dto/reservations/Creation';
import { DeleteResult } from 'typeorm';
import { VehicleService } from 'src/services/vehicle';
import { Vehicle } from 'src/entities/vehicle';

@Controller()
export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
  ) {}

  @Get('/api/reservations')
  async index(): Promise<Reservation[]> {
    return await this.reservationService.allReservations();
  }

  @Delete('/api/reservation/:id')
  async remove(@Param('id') id: number): Promise<DeleteResult> {
    const reservation = await this.reservationService.findOne({ id });
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    return await this.reservationService.remove(reservation);
  }

  @Patch('/api/reservation/:id')
  async update(
    @Param('id') id: number,
    @Body() reservationPayload: ReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationService.findOne({ id });
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }

    reservation.vehicle = await this.validatePayloadAndGetVehicleOrFail(
      reservationPayload,
    );
    reservation.start = reservationPayload.start;
    reservation.end = reservationPayload.end;
    return await this.reservationService.save(reservation);
  }

  @Post('/api/reservation')
  async createReservation(
    @Body() reservationPayload: ReservationDto,
  ): Promise<Reservation> {
    const vehicle = await this.validatePayloadAndGetVehicleOrFail(
      reservationPayload,
    );

    const reservation = new Reservation();
    if (reservationPayload.requestId !== undefined) {
      reservation.request.id = reservationPayload.requestId;
    }
    reservation.vehicle = vehicle;
    reservation.start = reservationPayload.start;
    reservation.end = reservationPayload.end;

    return await this.reservationService.save(reservation);
  }

  private async validatePayloadAndGetVehicleOrFail(
    reservationPayload: ReservationDto,
  ): Promise<Vehicle> {
    if (
      reservationPayload.start.getTime() >= reservationPayload.end.getTime()
    ) {
      throw new HttpException(
        'Invalid start and end time - start must be before end',
        HttpStatus.BAD_REQUEST,
      );
    }

    const vehicle = await this.vehicleService.findVehicleBy({
      id: reservationPayload.vehicleId,
    });

    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    if (
      !(await this.vehicleService.vehicleAvailable(
        vehicle,
        reservationPayload.start,
        reservationPayload.end,
      ))
    ) {
      throw new HttpException('Vehicle not available', HttpStatus.BAD_REQUEST);
    }

    return vehicle;
  }
}
