import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackController } from 'src/controllers/slack';
import { SlackVerificationMiddleware } from 'src/middleware/slack_verification';
import { ReservationModule } from './reservation';
import { VehicleModule } from './vehicle';

@Module({
  imports: [ConfigModule, VehicleModule, ReservationModule],
  controllers: [SlackController],
  providers: [],
  exports: [],
})
export class SlackModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SlackVerificationMiddleware).forRoutes(SlackController);
  }
}
