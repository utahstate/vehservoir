import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminCreationDto } from 'dto/auth/AdminCreation';
import { Admin } from 'src/entities/admin';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
  ) {}

  async findOne(options: Record<string, any>): Promise<Admin> {
    return this.adminRepo.findOne({ where: options });
  }

  async create(adminRegistration: AdminCreationDto): Promise<Admin> {
    if (!(await this.findOne({ username: adminRegistration.username }))) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(adminRegistration.password, salt);

      const admin = new Admin();
      admin.username = adminRegistration.username;
      admin.password = password;
      return this.adminRepo.save(admin);
    }
    throw new BadRequestException('Username already taken');
  }
}
