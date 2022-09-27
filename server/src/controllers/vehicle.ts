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
  Query,
  UseGuards,
} from '@nestjs/common';
import { VehicleType } from 'src/entities/vehicle_type';
import { Vehicle } from 'src/entities/vehicle';
import { VehicleAvailability, VehicleService } from 'src/services/vehicle';
import { VehicleCreationDto } from 'dto/vehicles/Creation';
import { Free } from 'dto/vehicles/Free';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt_auth';

@Controller()
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get('/api/vehicles')
  async index(@Query('type') name: string): Promise<Vehicle[]> {
    if (name) {
      return await this.vehicleService.findVehiclesBy(
        {
          type: { name },
        },
        {
          type: true,
        },
      );
    }
    return await this.vehicleService.allVehicles();
  }

  @Get('/api/vehicles/types')
  async types(): Promise<VehicleType[]> {
    return await this.vehicleService.allVehicleTypes();
  }

  @Get('/api/vehicle/:id')
  async getVehicle(@Param('id') id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return vehicle;
  }

  private async getOrCreateTypeFromBodyOrFail(
    vehiclePayload: Partial<VehicleCreationDto>,
  ): Promise<VehicleType> {
    const type = await this.vehicleService.findOrCreateTypeName(
      vehiclePayload.type.name,
      vehiclePayload.type.new,
    );
    if (!type) {
      throw new HttpException(
        `Vehicle type ${vehiclePayload.type.name} cannot be found (create it with new: true).`,
        HttpStatus.NOT_FOUND,
      );
    }
    return type;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api/vehicle')
  async createVehicle(
    @Body() vehiclePayload: VehicleCreationDto,
  ): Promise<Vehicle> {
    const vehicle = new Vehicle();
    vehicle.name = vehiclePayload.name;
    vehicle.type = await this.getOrCreateTypeFromBodyOrFail(vehiclePayload);

    return await this.vehicleService.save(vehicle);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/vehicle/:id')
  async updateVehicle(
    @Param('id') id: number,
    @Body() vehiclePayload: Partial<VehicleCreationDto>,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    if (vehicle.name) {
      vehicle.name = vehiclePayload.name;
    }
    if (vehiclePayload.type) {
      vehicle.type = await this.getOrCreateTypeFromBodyOrFail(vehiclePayload);
    }

    return await this.vehicleService.save(vehicle);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/vehicles/type/:type')
  async removeVehiclesOfTypeAndType(
    @Param('type') name: string,
  ): Promise<DeleteResult> {
    const vehicleType = await this.vehicleService.findTypeBy({ name });
    if (!vehicleType) {
      throw new HttpException('Vehicle type not found', HttpStatus.NOT_FOUND);
    }
    return await this.vehicleService.removeVehiclesOfTypeAndType(vehicleType);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/vehicle/:id')
  async removeVehicle(@Param('id') id: number): Promise<DeleteResult> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return await this.vehicleService.remove(vehicle);
  }

  @Get('/api/vehicles/free')
  async free(@Query() query: Free): Promise<VehicleAvailability[]> {
    const vehicleType = await this.vehicleService.findTypeBy({
      name: query.type,
    });

    if (!vehicleType) {
      throw new HttpException(
        `No such vehicle type ${query.type}, please create it or check your request`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return VehicleService.filterAvailabilitiesByPeriodExtension(
      await this.vehicleService.vehicleFreePeriodsBy(
        { type: vehicleType },
        query.start,
        query.end,
      ),
      query.period,
    );
  }
}
