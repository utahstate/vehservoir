import { Controller, Get } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle';
import { VehicleService } from '../providers/services/vehicle';

@Controller()
export class VehicleController {
  constructor(
    private vehicleService: VehicleService
  ) { }

  @Get('/api/vehicles')
  async index() : Promise<Vehicle[]> {
    return await this.vehicleService.findAll();
  }
}
