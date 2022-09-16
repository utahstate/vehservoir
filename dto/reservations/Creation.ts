import { Type } from "class-transformer";
import { IsDate, IsNumber } from "class-validator";

export class ReservationDto {
  @IsNumber()
  vehicleId: number;

  requestId: number | undefined;

  @IsDate()
  @Type(() => Date)
  start: Date;

  @IsDate()
  @Type(() => Date)
  end: Date;
}
