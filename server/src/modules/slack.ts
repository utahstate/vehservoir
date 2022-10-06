import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackController } from 'src/controllers/slack';
import { Request } from 'src/entities/request';
import { SlackUserVehicleTypePreference } from 'src/entities/slack_user_vehicle_type_preference';
import { SlackVerificationMiddleware } from 'src/middleware/slack_verification';
import { SlackRequestService } from 'src/services/slack_request';
import { SlackUserPreferenceService } from 'src/services/slack_user_preference';
import { ReservationModule } from './reservation';
import { VehicleModule } from './vehicle';

@Module({
  imports: [
    ConfigModule,
    VehicleModule,
    ReservationModule,
    TypeOrmModule.forFeature([Request, SlackUserVehicleTypePreference]),
  ],
  controllers: [SlackController],
  providers: [SlackRequestService, SlackUserPreferenceService],
  exports: [],
})
export class SlackModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SlackVerificationMiddleware).forRoutes(SlackController);
  }
}
