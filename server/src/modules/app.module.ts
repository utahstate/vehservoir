import { Module } from '@nestjs/common';
import { AppController } from 'src/controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

// VEHSERVOIR MODULES
import { VehicleModule } from './vehicle.module';
import { SlackModule } from './slack.module';
import { ReservationModule } from './reservation.module';
import { AdminModule } from './admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url:
          config.get('DATABASE_URL') ||
          'postgresql://postgres:postgres@localhost:5432/vehservoir',
        synchronize: true,
        entities: ['dist/src/entities/**/*.js'],
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    VehicleModule,
    ReservationModule,
    SlackModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
