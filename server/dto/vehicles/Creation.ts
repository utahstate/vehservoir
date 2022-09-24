import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

class VehicleTypeSpecificationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  new: boolean;
}

export class VehicleCreationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => VehicleCreationDto)
  type: VehicleTypeSpecificationDto;
}
