import { NestFactory } from '@nestjs/core';
import { AppModule } from './application.module';
import * as dotenv from 'dotenv';

dotenv.config();

const bootstrap = async () : Promise<void> => {
  const server = await NestFactory.create(AppModule);

  await server.listen(process.env.PORT || 3000);
}

void bootstrap();
