import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AdminCreationDto } from 'dto/auth/AdminCreation';
import { LocalAuthGuard } from 'src/auth/local_auth';
import { AdminService } from 'src/services/admin';
import { Admin } from 'src/entities/admin';

@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/api/admin/register')
  async create(@Body() adminRegistration: AdminCreationDto): Promise<Admin> {
    const admin = await this.adminService.create(adminRegistration);
    delete admin.password;
    return admin;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/api/admin/login')
  async login(@Request() req: any) {
    return req.user;
  }
}
