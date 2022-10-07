import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class ReservationDto {
  /**
   * A reservation's id.
   * @example 21
   */
  @IsNumber()
  vehicleId: number;

  /**
   * A reservations correlating slack request id.
   */
  @ApiHideProperty()
  requestId: number | undefined;

  /**
   * A reservation's start date.
   * @example 2022-10-04T20:33:37.029Z
   */
  @IsDate()
  @Type(() => Date)
  start: Date;

  /**
   * A reservation's end date.
   * @example 2022-10-04T21:03:37.029Z
   */
  @IsDate()
  @Type(() => Date)
  end: Date;
}
