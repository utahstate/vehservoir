import { Module } from "@nestjs/common";
import { RenderModule } from "nest-next";
import { AppController } from "../controllers/app";
import { TypeOrmModule } from "@nestjs/typeorm";
import { databaseConfig } from "../database/config";

// VEHSERVOIR MODULES
import { VehicleModule } from "./vehicle";
import { ReservationModule } from "./reservation";

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
    VehicleModule,
    ReservationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
