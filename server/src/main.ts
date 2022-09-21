import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow transformations on types
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Cors
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
  }

  await app.listen(4000);
}
bootstrap();
