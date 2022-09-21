import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Admin } from 'src/entities/admin';
import { AdminService } from 'src/services/admin';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private adminService: AdminService) {
    super();
  }

  async validate(username: string, password: string): Promise<Admin> {
    const admin = await this.adminService.validateAdmin(username, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return admin;
  }
}
