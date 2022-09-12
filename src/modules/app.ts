import { Module } from '@nestjs/common';
import { RenderModule } from 'nest-next';
import { AppController } from '../controllers/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../database/config';
import { VehicleModule } from './vehicle';
import Next from 'next';

@Module({
  imports: [
    RenderModule.forRootAsync(
      Next({
        dev: process.env.NODE_ENV !== 'production',
        conf: { useFilesystemPublicRoutes: false },
      }),
    ),
    TypeOrmModule.forRoot(databaseConfig),
    VehicleModule,
  ],
  controllers: [AppController],
})
export class AppModule { }