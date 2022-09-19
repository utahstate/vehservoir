import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "../entities/admin";
import { AdminController } from "../controllers/admin";
import { AdminService } from "../providers/services/admin";
import { AuthModule } from "./auth";

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
