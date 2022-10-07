import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { VehicleType } from 'src/entities/vehicle_type.entity';
import { VehicleController } from 'src/controllers/vehicle.controller';
import { VehicleService } from 'src/services/vehicle.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleType])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
