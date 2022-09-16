import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vehicle } from "../../entities/vehicle";
import { DeleteResult, Repository } from "typeorm";
import { VehicleType } from "../../entities/vehicle_type";
import { subtractRanges } from "../../utils/dates";

export interface VehicleAvailability {
  vehicle: Vehicle;
  availability: [Date, Date][];
}

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

  async findVehiclesBy(
    options: Record<string, any>,
    relations: Record<string, Boolean>
  ): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      relations,
      where: options,
    });
  }

  async findVehicleBy(options: Record<string, any>): Promise<Vehicle | null> {
    return this.vehicleRepo.findOne({ where: options });
  }

  async findTypeBy(options: Record<string, any>): Promise<VehicleType | null> {
    return this.vehicleTypeRepo.findOne({ where: options });
  }

  async remove(vehicle: Vehicle): Promise<DeleteResult> {
    return this.vehicleRepo.delete(vehicle);
  }

  async removeVehiclesOfTypeAndType(
    vehicleType: VehicleType
  ): Promise<DeleteResult> {
    // Cascades on delete
    return this.vehicleRepo.delete(vehicleType);
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    return this.vehicleRepo.save(vehicle);
  }

  async saveType(vehicleType: VehicleType): Promise<VehicleType> {
    return this.vehicleTypeRepo.save(vehicleType);
  }

  private async getVehiclesWithReservationOverlappingOrNone(
    options: Record<string, any>,
    start: Date,
    end: Date
  ): Promise<Vehicle[]> {
    return this.vehicleRepo
      .createQueryBuilder("vehicle")
      .leftJoinAndSelect(
        "vehicle.reservations",
        "reservation",
        "reservation.start BETWEEN :start and :end OR reservation.end between :start and :end",
        { start, end }
      )
      .where(options)
      .getMany();
  }

  // Return vehicle id => available reservation times between start and end for
  // each vehicle fitting options
  async vehicleFreePeriodsBy(
    options: Record<string, any>,
    start: Date,
    end: Date
  ): Promise<Map<number, VehicleAvailability>> {
    return this.getVehiclesWithReservationOverlappingOrNone(
      options,
      start,
      end
    ).then((vehicles) => {
      const result: Map<number, VehicleAvailability> = new Map<
        number,
        VehicleAvailability
      >();
      for (let vehicle of vehicles) {
        result.set(vehicle.id, {
          vehicle,
          availability: subtractRanges(
            [start, end],
            vehicle?.reservations.map(({ start, end }) => [start, end])
          ),
        });
      }
      return result;
    });
  }

  async vehicleAvailable(
    vehicle: Vehicle,
    start: Date,
    end: Date
  ): Promise<boolean> {
    const availability = (
      await this.vehicleFreePeriodsBy(vehicle, start, end)
    ).get(vehicle.id)?.availability;

    return (
      !!availability &&
      !!availability.length &&
      availability.every(
        ([aStart, aEnd]) =>
          aStart.getTime() === start.getTime() &&
          aEnd.getTime() === end.getTime()
      )
    );
  }
}
