import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vehicle } from "../../entities/vehicle";
import { Repository } from "typeorm";
import { VehicleType } from "../../entities/vehicle_type";

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,

    @InjectRepository(VehicleType)
    private vehicleTypeRepo: Repository<VehicleType>
  ) {}

  async allVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepo.find();
  }

  async allVehicleTypes(): Promise<VehicleType[]> {
    return this.vehicleTypeRepo.find();
  }

  async findTypeBy(options: Record<string, any>): Promise<VehicleType | null> {
    return this.vehicleTypeRepo.findOne({ where: options });
  }

  async findAllFree(): Promise<Vehicle[]> {
    return this.vehicleRepo.find({});
    //    const reservedPeriods = reservationRepo.select({...})
    //    return vehicles in reserved intersect timechunks
  }

  async findVehiclesBy(
    options: Record<string, any>,
    relations: Record<string, Boolean>
  ): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      relations,
      where: options,
    });
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    return this.vehicleRepo.save(vehicle);
  }

  async saveType(vehicleType: VehicleType): Promise<VehicleType> {
    return this.vehicleTypeRepo.save(vehicleType);
  }
}
