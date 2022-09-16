import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig: TypeOrmModuleOptions = {
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/vehservoir",
  synchronize: process.env.NODE_ENV !== "production",
  entities: ["src/entities/**/*.ts"],
  autoLoadEntities: true,
};
