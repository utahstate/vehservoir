import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(private configService: ConfigService) {}

  userIsAuthenticated(username: string, rawPassword: string): boolean | null {
    const SALT_ROUNDS = bcrypt.genSaltSync();
    const envPassword = this.configService.get("ADMIN_PASSWORD");
    const envUsername = this.configService.get("ADMIN_USERNAME");
    const hashedEnvironmentPassword = bcrypt.hashSync(envPassword, SALT_ROUNDS);

    const isAuthSuccessful = bcrypt.compareSync(
      rawPassword,
      hashedEnvironmentPassword
    );

    if (
      isAuthSuccessful &&
      username.toLowerCase() === envUsername.toLowerCase()
    ) {
      return true;
    }
    return false;
  }
}
