import { Module } from '@nestjs/common';
import { AdminController } from 'src/controllers/admin';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin';
import { AdminService } from 'src/services/admin';
import { AuthModule } from './auth';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), AuthModule],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
