import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackController } from 'src/controllers/slack';
import { Request } from 'src/entities/request';
import { SlackVerificationMiddleware } from 'src/middleware/slack_verification';
import { SlackRequestService } from 'src/services/slack_request';
import { ReservationModule } from './reservation';
import { VehicleModule } from './vehicle';

@Module({
  imports: [
    ConfigModule,
    VehicleModule,
    ReservationModule,
    TypeOrmModule.forFeature([Request]),
  ],
  controllers: [SlackController],
  providers: [SlackRequestService],
  exports: [],
})
export class SlackModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SlackVerificationMiddleware).forRoutes(SlackController);
  }
}
