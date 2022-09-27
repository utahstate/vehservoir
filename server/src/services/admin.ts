import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminSaveDto } from 'dto/auth/AdminSaveDto';
import { Admin } from 'src/entities/admin';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async findOne(options: Record<string, any>): Promise<Admin> {
    return this.adminRepo.findOne({ where: options });
  }

  async allAdmins(): Promise<Admin[]> {
    return this.adminRepo.find();
  }

  async save(admin: AdminSaveDto): Promise<Admin> {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(admin.password, salt);

    admin.username = admin.username.toLowerCase();
    admin.password = password;

    return await this.adminRepo.save(admin);
  }

  async validateAdmin(
    username: string,
    password: string,
  ): Promise<Admin | null> {
    const admin = await this.findOne({ username: username.toLowerCase() });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return null;
    }
    return admin;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async create(adminRegistration: AdminSaveDto): Promise<Admin> {
    if (!(await this.findOne({ username: adminRegistration.username }))) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(adminRegistration.password, salt);

      const admin = new Admin();
      admin.username = adminRegistration.username.toLowerCase();
      admin.password = password;
      return this.adminRepo.save(admin);
    }
    throw new BadRequestException('Username already taken');
  }

  async remove(admin: Admin): Promise<DeleteResult> {
    return await this.adminRepo.delete(admin.id);
  }
}
