import { Injectable } from '@nestjs/common';
import { AdminService } from './admin';
import { Admin } from 'src/entities/admin';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(
    username: string,
    password: string,
  ): Promise<Admin | null> {
    const admin = await this.adminService.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return null;
    }
    delete admin.password;
    return admin;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
