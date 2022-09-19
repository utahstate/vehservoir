import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminRegistrationDto } from "../../../dto/admin/Register";
import { Admin } from "../../entities/admin";
import { Repository } from "typeorm";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>
  ) {}

  async create(adminRegistrationDto: AdminRegistrationDto): Promise<Admin> {
    return this.adminRepo.save(adminRegistrationDto);
  }

  // async remove(options: Record<string, any>) {
  //   await this.adminRepo.delete({ where: options });
  // }

  async findOne(options: Record<string, any>): Promise<any> {
    return await this.adminRepo.findOne({ where: options });
  }
}
