import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vehservoir')
    .setDescription('The carefully curated Vehservoir API')
    .setVersion('1.0')
    .addTag('admin')
    .addTag('reservation')
    .addTag('slack')
    .addTag('vehicle')
    .addCookieAuth('JWT')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(4000);
}
bootstrap();
