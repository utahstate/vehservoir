import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from "@nestjs/common";
import { VehicleType } from "../entities/vehicle_type";
import { Vehicle } from "../entities/vehicle";
import { VehicleService } from "../providers/services/vehicle";
import type { VehicleCreationDto } from "../../dto/vehicles/Creation";

@Controller()
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get("/api/vehicles")
  async index(@Query("type") typeName: string): Promise<Vehicle[]> {
    if (typeName) {
      return await this.vehicleService.findVehiclesBy(
        {
          type: { name: typeName },
        },
        {
          type: true,
        }
      );
    }
    return await this.vehicleService.allVehicles();
  }

  @Post("/api/vehicles")
  async createVehicle(
    @Body() vehiclePayload: VehicleCreationDto
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
        `Vehicle type with name ${vehiclePayload.type.name} cannot be found - please create it.`,
        HttpStatus.NOT_FOUND
      );
    }

    const newVehicle = new Vehicle();
    newVehicle.name = vehiclePayload.name;
    newVehicle.type = vehicleType;

    return await this.vehicleService.save(newVehicle);
  }

  // TODO
  //  @Get('/api/vehicles/free')
  //  async index(@Query('start_time') startTime : Date,
  //              @Query('end_time') endTime: Date,
  //              @Query('period') period: number,
  //              @Query('vehicle_type') : Promise<Vehicle[]> {
  //     this.vehicleService.findAllFree(...args)
  //  }
}
