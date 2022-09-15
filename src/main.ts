import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app';
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";

dotenv.config();

const bootstrap = async (): Promise<void> => {
  const server = await NestFactory.create(AppModule);

  server.use(cookieParser());
  server.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  await server.listen(process.env.PORT || 3000);
};

void bootstrap();
