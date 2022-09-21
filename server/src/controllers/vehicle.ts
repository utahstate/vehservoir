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
} from '@nestjs/common';
import { VehicleType } from 'src/entities/vehicle_type';
import { Vehicle } from 'src/entities/vehicle';
import { VehicleAvailability, VehicleService } from 'src/services/vehicle';
import { VehicleCreationDto } from 'dto/vehicles/Creation';
import { Free } from 'dto/vehicles/Free';
import { DeleteResult } from 'typeorm';

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

  @Get('/api/vehicle/:id')
  async getVehicle(@Param('id') id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return vehicle;
  }

  @Post('/api/vehicles')
  async createVehicle(
    @Body() vehiclePayload: VehicleCreationDto,
  ): Promise<Vehicle> {
    let vehicleType = await this.vehicleService.findTypeBy({
      name: vehiclePayload.type.name,
    });

    if (!vehicleType && vehiclePayload.type.new) {
      const newVehicleType = new VehicleType();
      newVehicleType.name = vehiclePayload.type.name;
      vehicleType = await this.vehicleService.saveType(newVehicleType);
    } else if (!vehicleType) {
      throw new HttpException(
        `Vehicle type ${vehiclePayload.type.name} cannot be found - please create it.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newVehicle = new Vehicle();
    newVehicle.name = vehiclePayload.name;
    newVehicle.type = vehicleType;

    return await this.vehicleService.save(newVehicle);
  }

  @Patch('/api/vehicle/:id')
  async updateVehicle(
    @Param('id') id: number,
    @Body() vehiclePayload: { name: string },
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    if (!vehiclePayload.name) {
      throw new HttpException(
        'Only vehicle name can be updated',
        HttpStatus.BAD_REQUEST,
      );
    }
    vehicle.name = vehiclePayload.name;
    return await this.vehicleService.save(vehicle);
  }

  @Delete('/api/vehicles/:type')
  async removeVehiclesOfTypeAndType(
    @Param('type') name: string,
  ): Promise<DeleteResult> {
    const vehicleType = await this.vehicleService.findTypeBy({ name });
    if (!vehicleType) {
      throw new HttpException('Vehicle type not found', HttpStatus.NOT_FOUND);
    }
    return await this.vehicleService.removeVehiclesOfTypeAndType(vehicleType);
  }

  @Delete('/api/vehicles/:id')
  async removeVehicle(@Param('id') id: number): Promise<DeleteResult> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return await this.vehicleService.remove(vehicle);
  }

  @Get('/api/vehicles/free')
  async free(@Query() query: Free): Promise<VehicleAvailability[]> {
    if (
      query.start.getTime() >= query.end.getTime() ||
      query.period > (query.end.getTime() - query.start.getTime()) * 1000
    ) {
      throw new HttpException(
        'Invalid query parameters: start must be before end, and period must be less than or equal to the difference between end and start.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const vehicleType = await this.vehicleService.findTypeBy({
      name: query.type,
    });

    if (!vehicleType) {
      throw new HttpException(
        `No such vehicle type ${query.type} , please create it or check your request`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const vehicleAvailabilities: VehicleAvailability[] = Array.from(
      await this.vehicleService.vehicleFreePeriodsBy(
        { type: vehicleType },
        query.start,
        query.end,
      ),
    ).map(([, vehicleAvailability]) => vehicleAvailability);

    return vehicleAvailabilities
      .map((vehicleAvailability) => {
        // Availability is longer or equal to the query period
        const availability = vehicleAvailability.availability.filter(
          ([start, end]) =>
            end.getTime() - start.getTime() >= query.period * 1000,
        );
        // Overwrite availability with the filtered one
        return { ...vehicleAvailability, availability };
      })
      .filter((vehicleAvailability) => vehicleAvailability.availability.length);
  }
}
