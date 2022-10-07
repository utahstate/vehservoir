import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from 'src/controllers/reservation.controller';
import { Reservation } from 'src/entities/reservation.entity';
import { ReservationGateway } from 'src/gateways/reservation.gateway';
import { ReservationService } from 'src/services/reservation.service';
import { VehicleModule } from './vehicle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), VehicleModule],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationGateway],
  exports: [ReservationService],
})
export class ReservationModule {}
