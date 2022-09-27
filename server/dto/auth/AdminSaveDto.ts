import { IsString, MinLength } from 'class-validator';

export class AdminSaveDto {
  @MinLength(5)
  @IsString()
  username: string;

<<<<<<< HEAD
  @MinLength(8)
=======
  @MinLength(5)
>>>>>>> 2c5efa2 (New pages moment (vehicle actions, whole admin management page) :chad:)
  @IsString()
  password: string;
}
