import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Admin } from "../entities/admin";
import { AuthService } from "../providers/services/auth";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<Admin> {
    const admin = await this.authService.validateUser(username, password);

    if (!admin) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "Invalid Credentials",
        },
        HttpStatus.FORBIDDEN
      );
    }

    return admin;
  }
}
