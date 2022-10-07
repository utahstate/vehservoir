import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VehicleType } from 'src/entities/vehicle_type.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import {
  VehicleAvailability,
  VehicleService,
} from 'src/services/vehicle.service';
import { VehicleCreationDto } from 'dto/vehicles/Creation.dto';
import { Free } from 'dto/vehicles/Free.dto';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt_auth';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('vehicle')
@Controller()
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get('/api/vehicles')
  @ApiOperation({ summary: 'Get all vehicles given a type (ex. Golf Cart.)' })
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
  @ApiOperation({ summary: 'Get all vehicle types.' })
  async types(): Promise<VehicleType[]> {
    return await this.vehicleService.allVehicleTypes();
  }

  @Get('/api/vehicle/:id')
  @ApiOperation({ summary: 'Get a vehicle by id.' })
  async getVehicle(@Param('id') id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return vehicle;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/api/vehicle')
  @ApiOperation({ summary: 'Create a new vehicle.' })
  async createVehicle(
    @Body() vehiclePayload: VehicleCreationDto,
  ): Promise<Vehicle> {
    const vehicle = new Vehicle();
    vehicle.name = vehiclePayload.name;
    vehicle.type = await this.vehicleService.findOrCreateType(
      vehiclePayload.type,
    );

    return await this.vehicleService.save(vehicle);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/api/vehicle/:id')
  @ApiOperation({ summary: 'Update a vehicle by id.' })
  async updateVehicle(
    @Param('id') id: number,
    @Body() vehiclePayload: VehicleCreationDto,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    if (vehicle.name) {
      vehicle.name = vehiclePayload.name;
    }
    if (vehiclePayload.type) {
      vehicle.type = await this.vehicleService.findOrCreateType(
        vehiclePayload.type,
      );
    }

    return await this.vehicleService.save(vehicle);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/vehicles/type/:type')
  @ApiOperation({ summary: 'Delete a vehicle type.' })
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
  @ApiOperation({ summary: 'Delete a vehicle by id.' })
  async removeVehicle(@Param('id') id: number): Promise<DeleteResult> {
    const vehicle = await this.vehicleService.findVehicleBy({ id });
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
    return await this.vehicleService.remove(vehicle);
  }

  /**
   * Finds vehicles of a certain type that are free between start and end (in other words, don't
   * have a reservation) for at least `periodSeconds` intervals between that range.
   *
   * For example, if a vehicle is reserved from 1 PM to 1:15 PM and another from 2:30PM to 3:30PM,
   * and we ask for free vehicles that have periodSeconds of (60)(60)(1) [1 hour] from 12PM to
   * 4PM, that vehicle will be returned with its availability between 12PM and 4PM that are at
   * least one hour long (12PM - 1:15PM, 1:30PM - 2:30PM).
   */
  @Get('/api/vehicles/free')
  @ApiOperation({ summary: 'Get a list of vehicle availabilities.' })
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
      query.periodSeconds,
    );
  }
}
