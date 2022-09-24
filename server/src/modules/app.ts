import { Module } from '@nestjs/common';
import { AppController } from 'src/controllers/app';
import { TypeOrmModule } from '@nestjs/typeorm';

// VEHSERVOIR MODULES
import { VehicleModule } from './vehicle';
import { SlackModule } from './slack';
import { ReservationModule } from './reservation';
import { AdminModule } from './admin';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
        synchronize: config.get('NODE_ENV') !== 'production',
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
