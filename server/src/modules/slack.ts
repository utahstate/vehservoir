import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackController } from 'src/controllers/slack';
import { ReservationModule } from './reservation';
import { VehicleModule } from './vehicle';

@Module({
  imports: [ConfigModule, VehicleModule, ReservationModule],
  controllers: [SlackController],
  providers: [],
  exports: [],
})
export class SlackModule {}
