import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AdminService } from 'src/services/admin';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  static extractJWTFromCookie(req: Request) {
    if (req && req.cookies) {
      return req.cookies['jwt'];
    }
    return null;
  }

  async validate(payload: any) {
    if (
      await this.adminService.findOne({
        id: payload.sub,
      })
    ) {
      return payload;
    }
  }
}
