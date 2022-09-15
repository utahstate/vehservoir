import { Module } from '@nestjs/common';
import { RenderModule } from 'nest-next';
import { AppController } from '../controllers/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../database/config';
import { ConfigModule } from "@nestjs/config";
import { VehicleModule } from "./vehicle";
import { AdminModule } from "./admin";
import Next from "next";

@Module({
  imports: [
    RenderModule.forRootAsync(
      Next({
        dev: process.env.NODE_ENV !== "production",
        conf: { useFilesystemPublicRoutes: false },
      })
    ),
    TypeOrmModule.forRoot(databaseConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    VehicleModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}