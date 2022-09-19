import { Injectable } from "@nestjs/common";
import { AdminService } from "./admin";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AdminRegistrationDto } from "../../../dto/admin/Register";
import { Admin } from "../../entities/admin";

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const admin = await this.adminService.findOne({ username });

    console.log(admin.password);

    if (await bcrypt.compare(password, admin.password)) {
      const { password, ...rest } = admin;
      return rest;
    }
    return null;
  }

  async login(user: Record<string, any>) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
