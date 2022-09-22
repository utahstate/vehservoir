import { Test, TestingModule } from '@nestjs/testing';
import { Vehicle } from 'src/entities/vehicle';
import { VehicleType } from 'src/entities/vehicle_type';
import { VehicleAvailability, VehicleService } from 'src/services/vehicle';
import { VehicleController } from './vehicle';
import { VehicleCreationDto } from 'dto/vehicles/Creation';
import { HttpException, NotFoundException } from '@nestjs/common';

// Firstly mock the VehicleService database wrapper and create dummy data
let vehicleTypeGlobalId = 0;
let vehicleTypes = [
  {
    id: ++vehicleTypeGlobalId,
    name: 'Golf Cart',
  },
  {
    id: ++vehicleTypeGlobalId,
    name: 'Minivan',
  },
].map((vehicleType) =>
  ((newVehicleType) => {
    newVehicleType.name = vehicleType.name;
    newVehicleType.id = vehicleType.id;
    return newVehicleType;
  })(new VehicleType()),
) as unknown as VehicleType[];

let vehicleGlobalId = 0;
let vehicles = [
  {
    id: ++vehicleGlobalId,
    name: 'A Golf Cart',
    type: vehicleTypes[0],
  },
  {
    id: ++vehicleGlobalId,
    name: "Logan's Gamer Golf Cart (TM)",
    type: vehicleTypes[0],
  },
  {
    id: ++vehicleGlobalId,
    name: 'A Dumb Minivan',
    type: vehicleTypes[1],
  },
  {
    id: ++vehicleGlobalId,
    name: "Logan's Gamer Minivan (TM)",
    type: vehicleTypes[1],
  },
].map((vehicle) =>
  ((newVehicle) => {
    newVehicle.id = vehicle.id;
    newVehicle.name = vehicle.name;
    newVehicle.type = vehicle.type as unknown as VehicleType;
    return newVehicle;
  })(new Vehicle()),
) as unknown as Vehicle[];

const vehicleTypeEquality = (
  vehicleType: VehicleType,
  options: any,
): boolean => {
  return vehicleType.name === options.name || vehicleType.id === options.id;
};
const vehicleServiceMocks = {
  allVehicleTypes: async () => vehicleTypes,
  allVehicles: async (): Promise<Vehicle[]> => vehicles,
  findTypeBy: async (options: any): Promise<VehicleType | undefined> =>
    vehicleTypes.find((vehicleType) =>
      vehicleTypeEquality(vehicleType, options),
    ),
  findVehiclesBy: async (options: any): Promise<Vehicle[]> =>
    vehicles.filter(
      (vehicle) =>
        (options.id && options.id === vehicle.id) ||
        (options.type && vehicleTypeEquality(vehicle.type, options.type)),
    ),
  findVehicleBy: async (options: any): Promise<Vehicle | undefined> =>
    vehicles.find(
      (vehicle) =>
        vehicle.id === options.id ||
        (options.type && vehicleTypeEquality(options.type, vehicle.type)),
    ),
  save: async (vehicle: Vehicle): Promise<Vehicle> => {
    let result: Vehicle;
    if (vehicle.id && vehicle.id < vehicleGlobalId) {
      const foundIndex = vehicles.findIndex((v) => v.id === vehicle.id);
      vehicles[foundIndex] = { ...vehicles[foundIndex], ...vehicle };
      result = vehicles[foundIndex];
    } else {
      vehicle.id = ++vehicleGlobalId;
      vehicles.push(vehicle);
      result = vehicle;
    }
    return result;
  },
  saveType: async (vehicleType: VehicleType): Promise<VehicleType> => {
    vehicleType.id = ++vehicleTypeGlobalId;
    vehicleTypes.push(vehicleType);
    return vehicleType;
  },
  remove: async (vehicle: Vehicle): Promise<Vehicle> => {
    const index = vehicles.findIndex((v) => v.id === vehicle.id);
    if (index !== -1) {
      vehicles.splice(index, 1);
    }
    return vehicle;
  },
  removeVehiclesOfTypeAndType: async (
    vehicleType: VehicleType,
  ): Promise<VehicleType[]> => {
    vehicles = vehicles.filter(
      (vehicle) => !vehicleTypeEquality(vehicle.type, vehicleType),
    );
    vehicleTypes = vehicleTypes.filter(
      (type) => !vehicleTypeEquality(type, vehicleType),
    );
    return vehicleTypes;
  },
  findOrCreateTypeName: async (
    name: string,
    createIfNotFound: boolean,
  ): Promise<VehicleType> => {
    const vehicleType = await vehicleServiceMocks.findTypeBy({
      name: name,
    });

    if (!vehicleType && createIfNotFound) {
      const newVehicleType = new VehicleType();
      newVehicleType.name = name;
      return await vehicleServiceMocks.saveType(newVehicleType);
    }
    return vehicleType;
  },
  vehicleFreePeriodsBy: async (
    _options: Record<string, any>,
    _start: Date,
    _end: Date,
  ): Promise<Map<number, VehicleAvailability>> => {
    const vehicleAvailabilities = new Map<number, VehicleAvailability>();
    vehicleAvailabilities.set(vehicles[0].id, {
      vehicle: vehicles[0],
      availability: [
        [
          new Date('2022-01-01T00:00:00.000Z'),
          new Date('2022-01-01T01:00:00.000Z'),
        ],
        [
          new Date('2022-01-01T02:00:00.000Z'),
          new Date('2022-01-01T02:15:00.000Z'),
        ],
      ],
    });
    vehicleAvailabilities.set(vehicles[1].id, {
      vehicle: vehicles[1],
      availability: [
        [
          new Date('2022-01-01T00:00:00.000Z'),
          new Date('2022-01-01T00:30:00.000Z'),
        ],
      ],
    });
    return vehicleAvailabilities;
  },
};

// Then we can FINALLY do the tests
describe('VehicleController', () => {
  let vehicleController: VehicleController;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: vehicleServiceMocks,
        },
      ],
    }).compile();

    vehicleController = testingModule.get<VehicleController>(VehicleController);
  });

  describe('index', () => {
    it('should list all vehicles', async () => {
      expect(await vehicleController.index('')).toEqual(vehicles);
    });

    it('should filter by type name when injected from url query', async () => {
      expect(await vehicleController.index('Minivan')).toEqual(
        vehicles.filter((x) => x.type.name === 'Minivan'),
      );
    });
  });

  describe('id route', () => {
    it('should find a vehicle by id', async () => {
      expect(await vehicleController.getVehicle(1)).toEqual(vehicles[0]);
    });

    it('should fail when the vehicle is not found', async () => {
      try {
        await vehicleController.getVehicle(999);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('free', () => {
    it('should fail when a type does not exist', async () => {
      try {
        await vehicleController.free({
          type: 'Does not exist',
          start: new Date(),
          end: new Date(),
          period: 0,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should fail if period is longer than the provided range', async () => {
      const start = new Date();
      const end = new Date();
      end.setHours(end.getHours() + 1);
      try {
        await vehicleController.free({
          type: 'Minivan',
          start,
          end,
          period: 3600 * 1000 + 1,
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should only return vehicle availabilities of a period length', async () => {
      const start = new Date('2022-01-01T00:00:00.000Z');
      const end = new Date('2022-01-01T06:00:00.000Z');

      const vehicleAvailabilities = await vehicleController.free({
        start,
        end,
        type: 'Golf Cart',
        period: 60 * 60,
      });

      expect(vehicleAvailabilities).toEqual([
        {
          vehicle: vehicles[0],
          availability: [
            [
              new Date('2022-01-01T00:00:00.000Z'),
              new Date('2022-01-01T01:00:00.000Z'),
            ],
          ],
        },
      ]);
    });
  });

  describe('create', () => {
    it('should create a vehicle with an already created type', async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Van",
        type: {
          name: 'Minivan',
          new: false,
        },
      };
      expect(await vehicleController.createVehicle(body)).toEqual({
        name: body.name,
        id: vehicleGlobalId,
        type: {
          id: vehicleTypeGlobalId,
          name: 'Minivan',
        },
      });
    });

    it('should fail when the type is not found', async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Submarine",
        type: {
          name: 'Submarine',
          new: false,
        },
      };
      try {
        await vehicleController.createVehicle(body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it("should create a vehicle with a new type if it's not found", async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Submarine",
        type: {
          name: 'Submarine',
          new: true,
        },
      };
      expect(await vehicleController.createVehicle(body)).toEqual({
        name: body.name,
        id: vehicleGlobalId,
        type: {
          id: vehicleTypeGlobalId,
          name: 'Submarine',
        },
      });
    });
  });

  describe('put', () => {
    it('should update all fields on a vehicle', async () => {
      const vehicle = await vehicleController.getVehicle(1);

      await vehicleController.updateVehicle(1, {
        type: {
          name: 'bike',
          new: true,
        },
        name: 'Bicycle 1',
      });

      expect(vehicle).toEqual({
        id: vehicle.id,
        name: 'Bicycle 1',
        type: {
          id: vehicleTypeGlobalId,
          name: 'bike',
        },
      });
    });

    it('should update partial fields on a vehicle', async () => {
      const vehicle = await vehicleController.getVehicle(1);

      await vehicleController.updateVehicle(1, {
        name: 'Bicycle 2',
      });

      expect(vehicle).toEqual({
        id: vehicle.id,
        name: 'Bicycle 2',
        type: {
          id: vehicleTypeGlobalId,
          name: 'bike',
        },
      });
    });

    it('should fail to update non existing vehicles', async () => {
      try {
        await vehicleController.updateVehicle(999, {
          name: 'Bicycle 2',
        });
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('delete', () => {
    it('should delete vehicles of type and that type', async () => {
      await vehicleController.removeVehiclesOfTypeAndType('Minivan');

      const typeExists = vehicleTypes.some((x) => x.name === 'Minivan');
      expect(typeExists).toBeFalsy();

      const vehiclesExist = vehicles.some((x) => x.type.name === 'Minivan');
      expect(vehiclesExist).toBeFalsy();
    });

    it('should fail to delete the same type', async () => {
      try {
        await vehicleController.removeVehiclesOfTypeAndType('Minivan');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should delete a single vehicle', async () => {
      await vehicleController.removeVehicle(1);

      const vehicleExists = vehicles.some((x) => x.id === 1);
      expect(vehicleExists).toBeFalsy();
    });

    it('should fail to delete the same vehicle', async () => {
      try {
        await vehicleController.removeVehicle(1);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });
});
