import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle';
import { VehicleType } from 'src/entities/vehicle_type';
import { VehicleController } from 'src/controllers/vehicle';
import { VehicleService } from 'src/providers/services/vehicle';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleType])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
