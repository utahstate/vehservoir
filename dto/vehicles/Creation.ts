import { IsObject, IsString } from "class-validator";

export class VehicleCreationDto {
  @IsString()
  name: string;

  @IsObject()
  type: {
    name: string;
    new: boolean;
  };
}
