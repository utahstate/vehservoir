import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminCreationDto } from 'dto/auth/AdminCreation';
import { JwtAuthGuard } from 'src/auth/jwt_auth';
import { LocalAuthGuard } from 'src/auth/local_auth';
import { Admin } from 'src/entities/admin';
import { AdminService } from 'src/services/admin';

@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/api/admin/register')
  async create(@Body() adminRegistration: AdminCreationDto): Promise<Admin> {
    const admin = await this.adminService.create(adminRegistration);
    delete admin.password;
    return admin;
  }

  @UseGuards(LocalAuthGuard)
  @Post('/api/admin/login')
  async login(@Res({ passthrough: true }) res: any, @Request() req: any) {
    const twelveHours = 12 * (60 * 60 * 1000);

    const token = await this.adminService.login(req.user);
    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: twelveHours,
    });

    return {
      message: 'Login successful',
      expiration: new Date(new Date().getTime() + twelveHours),
    };
  }

  @Get('/api/admin/logout')
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('jwt');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/admin/profile')
  getProfile(@Request() req: any) {
    return { username: req.user.username, id: req.user.sub };
  }
}
