import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Admin } from 'src/entities/admin';
import { AuthService } from 'src/services/auth';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<Admin> {
    const admin = await this.authService.validateAdmin(username, password);
    console.log(admin);
    if (!admin) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    return admin;
  }
}
