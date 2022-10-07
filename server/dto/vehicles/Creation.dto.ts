import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

class VehicleTypeSpecificationDto {
  /**
   * A vehicle types name.
   * @example 'Golf Cart'
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Specifies if this is a new vehicle type.
   * @example true
   */
  @IsBoolean()
  new: boolean;

  @IsHexColor()
  color: string;
}

export class VehicleCreationDto {
  /**
   * A vehicles name.
   * @example 'Da Pimp Cart 😎'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * A vehicles type.
   */
  @ValidateNested()
  @Type(() => VehicleCreationDto)
  type: VehicleTypeSpecificationDto;
}
