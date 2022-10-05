import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from 'src/controllers/reservation';
import { Reservation } from 'src/entities/reservation';
import { ReservationGateway } from 'src/gateways/reservation.gateway';
import { ReservationService } from 'src/services/reservation';
import { VehicleModule } from './vehicle';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), VehicleModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationGateway],
  exports: [ReservationService],
})
export class ReservationModule {}
