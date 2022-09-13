import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReservationController } from "../controllers/reservation";
import { Reservation } from "../entities/reservation";
import { ReservationService } from "../providers/services/reservation";
import { VehicleModule } from "./vehicle";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation])],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
