import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // This is required for SlackVerificationMiddleware HMAC
  });

  app.use(cookieParser());

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
