import { Module } from '@nestjs/common';
import { AppController } from 'src/controllers/app';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from 'src/database/config';

// VEHSERVOIR MODULES
import { VehicleModule } from './vehicle';
import { ReservationModule } from './reservation';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    VehicleModule,
    ReservationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
