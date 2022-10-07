import { Module } from '@nestjs/common';
import { AdminController } from 'src/controllers/admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { AdminService } from 'src/services/admin.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/auth/local_strategy';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/jwt_strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  providers: [AdminService, LocalStrategy, JwtStrategy],
  controllers: [AdminController],
})
export class AdminModule {}
