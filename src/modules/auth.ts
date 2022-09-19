import { Module } from "@nestjs/common";
import { AuthService } from "../providers/services/auth";
import { LocalStrategy } from "../auth/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AdminService } from "../providers/services/admin";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "../entities/admin";
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "12h" },
      }),
    }),
  ],
  providers: [AuthService, AdminService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
