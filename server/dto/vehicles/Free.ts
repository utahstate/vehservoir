import { Type } from "class-transformer";
import { IsDate, IsString, IsNumber, IsPositive } from "class-validator";

export class Free {
  @IsString()
  type: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  period: number;

  @IsDate()
  @Type(() => Date)
  start: Date;

  @IsDate()
  @Type(() => Date)
  end: Date;
}
