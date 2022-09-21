import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/auth/local_strategy';
import { AuthService } from 'src/services/auth';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from 'src/services/admin';
import { Admin } from 'src/entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), PassportModule],
  providers: [AuthService, LocalStrategy, AdminService],
  exports: [AuthService],
})
export class AuthModule {}
