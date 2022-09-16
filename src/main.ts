import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app";
import { ValidationPipe } from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();

const bootstrap = async (): Promise<void> => {
  const server = await NestFactory.create(AppModule);

  // Allow transformations on types
  server.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    })
  );

  await server.listen(process.env.PORT || 3000);
};

void bootstrap();
