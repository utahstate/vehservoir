import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { DeleteResult, Repository } from 'typeorm';
import { VehicleType } from 'src/entities/vehicle_type.entity';
import { subtractRanges } from 'src/utils/dates';
import { Reservation } from 'src/entities/reservation.entity';

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
    private vehicleTypeRepo: Repository<VehicleType>,
  ) {}

  async allVehicles(): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      relations: { type: true },
      order: {
        id: 'desc',
      },
    });
  }

  async allVehicleTypes(): Promise<VehicleType[]> {
    return this.vehicleTypeRepo.find({ order: { id: 'desc' } });
  }

  async findVehiclesBy(
    options: Record<string, any>,
    relations: Record<string, boolean>,
  ): Promise<Vehicle[]> {
    return this.vehicleRepo.find({
      relations,
      where: options,
      order: {
        id: 'desc',
      },
    });
  }

  async findVehicleBy(options: Record<string, any>): Promise<Vehicle> {
    return this.vehicleRepo.findOne({ where: options });
  }

  async findTypeBy(options: Record<string, any>): Promise<VehicleType> {
    return this.vehicleTypeRepo.findOne({ where: options });
  }

  async findOrCreateType(type: Partial<VehicleType>): Promise<VehicleType> {
    let vehicleType = await this.findTypeBy({ name: type.name });

    if (!vehicleType) {
      vehicleType = new VehicleType();
      vehicleType.name = type.name;

      const previousTypeWithColor = await this.findTypeBy({
        color: type.color,
      });
      if (previousTypeWithColor) {
        throw new BadRequestException(
          `Color already exists for ${previousTypeWithColor.name}`,
        );
      }
    }
    vehicleType.color = type.color;
    return await this.saveType(vehicleType);
  }

  async remove(vehicle: Vehicle): Promise<DeleteResult> {
    return this.vehicleRepo.delete(vehicle);
  }

  async removeVehiclesOfTypeAndType(
    vehicleType: VehicleType,
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
    end: Date,
  ): Promise<Vehicle[]> {
    return this.vehicleRepo
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect(
        'vehicle.reservations',
        'reservation',
        'NOT((:start < reservation.start AND :end >= reservation.end) AND (reservation.start < :start AND reservation.end >= :end))',
        { start, end },
      )
      .where(options)
      .getMany();
  }

  // Return vehicle id => available reservation times between start and end for
  // each vehicle fitting options
  async vehicleFreePeriodsBy(
    options: Record<string, any>,
    start: Date,
    end: Date,
    ignoreReservationsIds: Set<number> = new Set(),
  ): Promise<Map<number, VehicleAvailability>> {
    return this.getVehiclesWithReservationOverlappingOrNone(
      options,
      start,
      end,
    ).then((vehicles) => {
      const result: Map<number, VehicleAvailability> = new Map<
        number,
        VehicleAvailability
      >();
      for (const vehicle of vehicles) {
        result.set(vehicle.id, {
          vehicle,
          availability: subtractRanges(
            [start, end],
            vehicle?.reservations
              .filter(({ id }) => !ignoreReservationsIds.has(id))
              .map(({ start, end }) => [start, end]),
          ),
        });
      }
      return result;
    });
  }

  public static filterAvailabilitiesByPeriodExtension(
    vehicleAvailabilityMap: Map<number, VehicleAvailability>,
    periodSeconds: number,
  ): VehicleAvailability[] {
    const vehicleAvailabilities: VehicleAvailability[] = Array.from(
      vehicleAvailabilityMap,
    ).map(([, vehicleAvailability]) => vehicleAvailability);

    return vehicleAvailabilities
      .map((vehicleAvailability) => {
        // Availability is longer or equal to the query period
        const availability = vehicleAvailability.availability.filter(
          ([start, end]) =>
            end.getTime() - start.getTime() >= periodSeconds * 1000,
        );
        // Overwrite availability with the filtered one
        return { ...vehicleAvailability, availability };
      })
      .filter((vehicleAvailability) => vehicleAvailability.availability.length);
  }

  async vehicleAvailable(
    vehicle: Vehicle,
    start: Date,
    end: Date,
    withIgnoringReservations: Reservation[] = [],
  ): Promise<boolean> {
    const availability = (
      await this.vehicleFreePeriodsBy(
        vehicle,
        start,
        end,
        new Set(withIgnoringReservations.map((reservation) => reservation.id)),
      )
    ).get(vehicle.id)?.availability;

    return (
      !!availability &&
      !!availability.length &&
      availability.every(
        ([aStart, aEnd]) =>
          aStart.getTime() === start.getTime() &&
          aEnd.getTime() === end.getTime(),
      )
    );
  }
}
