import { Test, TestingModule } from "@nestjs/testing";
import { Vehicle } from "../entities/vehicle";
import { VehicleType } from "../entities/vehicle_type";
import { VehicleService } from "../providers/services/vehicle";
import { VehicleController } from "./vehicle";
import type { VehicleCreationDto } from "../../dto/vehicles/Creation";
import { HttpException } from "@nestjs/common";

let vehicleTypeGlobalId = 0;
const vehicleTypes = [
  {
    id: ++vehicleTypeGlobalId,
    name: "Golf Cart",
  }, 
  {
    id: ++vehicleTypeGlobalId,
    name: "Minivan",
  }
].map(vehicleType => (newVehicleType => {
    newVehicleType.name = vehicleType.name;
    newVehicleType.id = vehicleType.id;
    return newVehicleType;
  })(new VehicleType())
) as unknown as VehicleType[];

let vehicleGlobalId = 0;
const vehicles = [
  {
    id: ++vehicleGlobalId,
    name: "Logan's Golf Cart",
    type: vehicleTypes[0],
  },
  {
    id: ++vehicleGlobalId,
    name: "Logan's Minivan",
    type: vehicleTypes[1],
  }
].map(vehicle => 
  (newVehicle => {
    newVehicle.id = vehicle.id;
    newVehicle.name = vehicle.name;
    newVehicle.type = vehicle.type as unknown as VehicleType;
    return newVehicle;
  })(new Vehicle())
) as unknown as Vehicle[];

const vehicleTypeEquality = (vehicleType : VehicleType, options : any) : Boolean => {
  return vehicleType.name === options.name || vehicleType.id === options.id;
}
const vehicleServiceMocks = {
  allVehicleTypes: async () => vehicleTypes,
  allVehicles: async () : Promise<Vehicle[]> => vehicles,
  findTypeBy: async (options: any) : Promise<VehicleType | undefined> => 
                vehicleTypes.find((vehicleType) => vehicleTypeEquality(vehicleType, options)),
  findVehiclesWithTypeBy: async (options: any) : Promise<Vehicle[]> => 
                vehicles.filter((vehicle) => vehicleTypeEquality(vehicle.type, options)),
  save: async (vehicle: Vehicle) : Promise<Vehicle> => { 
    vehicle.id = ++vehicleGlobalId;
    vehicles.push(vehicle); 
    return vehicle; 
  },
  saveType: async (vehicleType: VehicleType) : Promise<VehicleType> => { 
    vehicleType.id = ++vehicleTypeGlobalId;
    vehicleTypes.push(vehicleType);
    return vehicleType; 
  }
};

describe("VehicleController", () => {
  let vehicleController : VehicleController;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        {
          provide: VehicleService,
          useValue: vehicleServiceMocks
        }
      ]
    }).compile();

    vehicleController = testingModule.get<VehicleController>(VehicleController);
  });

  describe("index", () => {
    it("should list all vehicles", async () => {
      expect(await vehicleController.index("")).toEqual(vehicles);
    });

    it("should filter by type name when injected from url query", async () => {
      expect(await vehicleController.index("Minivan")).toEqual(vehicles.filter((x) => x.type.name === "Minivan"));
    });
  });

  describe("create", () => {
    it("should create a vehicle with an already created type", async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Van",
        type: {
          name: "Minivan",
          new: false,
        }
      };
      expect(await vehicleController.createVehicle(body)).toEqual({
        name: body.name,
        id: 3,
        type: {
          id: 2,
          name: "Minivan",
        }
      });
    });

    it("should fail when the type is not found", async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Submarine",
        type: {
          name: "Submarine",
          new: false,
        }
      };
      try {
        await vehicleController.createVehicle(body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    })

    it("should create a vehicle with a new type if it's not found", async () => {
      const body: VehicleCreationDto = {
        name: "Logan's Gamer Submarine",
        type: {
          name: "Submarine",
          new: true,
        }
      };
      expect(await vehicleController.createVehicle(body)).toEqual({
        name: body.name,
        id: 4,
        type: {
          id: 3,
          name: "Submarine",
        }
      });
    });
  })
});