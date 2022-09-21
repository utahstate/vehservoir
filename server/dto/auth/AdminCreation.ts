import { IsString } from 'class-validator';

export class AdminCreationDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
