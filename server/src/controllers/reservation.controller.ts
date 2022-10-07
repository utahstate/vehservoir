import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { ReservationService } from 'src/services/reservation.service';
import { Reservation } from 'src/entities/reservation.entity';
import { ReservationDto } from 'dto/reservations/Reservation.dto';
import {
  Between,
  DeleteResult,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { VehicleService } from 'src/services/vehicle.service';
import { Vehicle } from 'src/entities/vehicle.entity';
import { JwtAuthGuard } from 'src/auth/jwt_auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('reservation')
@Controller()
export class ReservationController {
  constructor(
    private reservationService: ReservationService,
    private vehicleService: VehicleService,
  ) {}

  @Get('/api/reservations')
  @ApiOperation({ summary: 'Gets all reservations.' })
  async index(): Promise<Reservation[]> {
    return await this.reservationService.allReservations();
  }

  @Get('/api/reservations/current')
  @ApiOperation({ summary: 'Gets current reservations.' })
  async getCurrentReservations(): Promise<Reservation[]> {
    return await this.reservationService.findReservationsBy(
      {
        start: LessThanOrEqual(new Date()),
        end: MoreThanOrEqual(new Date()),
      },
      { vehicle: true },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/reservation/:id')
  @ApiOperation({ summary: 'Deletes a reservation given an id.' })
  async remove(@Param('id') id: number): Promise<DeleteResult> {
    const reservation = await this.reservationService.findOne({ id });
    if (!reservation) {
      throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
    }
    return await this.reservationService.remove(reservation);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/api/reservation/:id')
  @ApiOperation({ summary: 'Updates a reservation given an id.' })
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
      [reservation],
    );
    reservation.start = reservationPayload.start;
    reservation.end = reservationPayload.end;
    return await this.reservationService.save(reservation);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api/reservation')
  @ApiOperation({ summary: 'Creates a new reservation.' })
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
    withIgnoreReservations: Reservation[] = [],
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
        withIgnoreReservations,
      ))
    ) {
      throw new HttpException('Vehicle not available', HttpStatus.BAD_REQUEST);
    }

    return vehicle;
  }

  @Get('/api/reservations/:vehicleId')
  @ApiOperation({ summary: 'Gets all reservations for a given vehicle id.' })
  async getReservationsByVehicleId(
    @Param('vehicleId') vehicleId: number,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ): Promise<Reservation[]> {
    if (!(start && end) || start.getTime() >= end.getTime()) {
      throw new HttpException('Invalid Dates', HttpStatus.BAD_REQUEST);
    }

    return await this.reservationService.findReservationsBy(
      {
        vehicle: { id: vehicleId },
        start: Between(start, end),
      },
      { vehicle: true, request: true },
    );
  }
}
