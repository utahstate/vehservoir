import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleType } from '../../entities/vehicle_type';
import { Vehicle } from '../../entities/vehicle';
import { Repository } from 'typeorm';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
  ) { }

  async findAll() : Promise<Vehicle[]> {
    return this.vehicleRepo.find();
  }

  async findByType(vehicleType: VehicleType) : Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      relations: {
        type: true
      },
      where: {
        type: vehicleType
      }
    });
  }
}