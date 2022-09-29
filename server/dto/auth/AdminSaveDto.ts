import { IsString, MinLength } from 'class-validator';

export class AdminSaveDto {
  @MinLength(5)
  @IsString()
  username: string;

  @MinLength(8)
  @IsString()
  password: string;
}
