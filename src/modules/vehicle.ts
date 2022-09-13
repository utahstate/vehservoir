import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../entities/vehicle';
import { VehicleType } from '../entities/vehicle_type';
import { VehicleController } from '../controllers/vehicle';
import { VehicleService } from '../providers/services/vehicle';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleType])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule { }