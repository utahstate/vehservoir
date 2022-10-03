import { Module } from '@nestjs/common';
import { AppController } from 'src/controllers/app';
import { TypeOrmModule } from '@nestjs/typeorm';

// VEHSERVOIR MODULES
import { VehicleModule } from './vehicle';
import { SlackModule } from './slack';
import { ReservationModule } from './reservation';
import { AdminModule } from './admin';
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
