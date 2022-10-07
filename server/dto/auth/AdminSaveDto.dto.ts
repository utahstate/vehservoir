import { IsString, MinLength } from 'class-validator';

export class AdminSaveDto {
  /**
   * An admin's username
   * @example 'Xx_Chad_xX'
   */
  @MinLength(5)
  @IsString()
  username: string;

  /**
   * An admin's password
   * @example 'alphaOmegaChi32?'
   */
  @MinLength(8)
  @IsString()
  password: string;
}
