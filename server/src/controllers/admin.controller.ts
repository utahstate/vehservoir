import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminSaveDto } from 'dto/auth/AdminSaveDto.dto';
import { JwtAuthGuard } from 'src/auth/jwt_auth';
import { LocalAuthGuard } from 'src/auth/local_auth';
import { Admin } from 'src/entities/admin.entity';
import { AdminService } from 'src/services/admin.service';
import { DeleteResult } from 'typeorm';

@ApiTags('admin')
@ApiCookieAuth()
@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/api/admin/register')
  @ApiOperation({ summary: "Register's a new admin." })
  async create(@Body() adminRegistration: AdminSaveDto): Promise<Admin> {
    const admin = await this.adminService.create(adminRegistration);
    delete admin.password;
    return admin;
  }

  /**
   * Compares a request body with stored usernames, and hashed passwords using bcrypt
   * to validate users. Then makes usage of a JWT auth token (with an expiry of 12h)
   * stored within a cookie to set admin sessions.
   */
  @UseGuards(LocalAuthGuard)
  @Post('/api/admin/login')
  @ApiOperation({ summary: "Log's in a user." })
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
      id: req.user.id,
      expiration: new Date(new Date().getTime() + twelveHours),
    };
  }

  /**
   * Clears the cookie storing the JWT token, effectively ending a users session.
   */
  @Get('/api/admin/logout')
  @ApiOperation({ summary: 'Logs out a user.' })
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('jwt');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/admin/profile')
  @ApiOperation({ summary: 'Gets an admin users profile information.' })
  getProfile(@Request() req: any) {
    return { username: req.user.username, id: req.user.sub };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/api/admins')
  @ApiOperation({ summary: 'Gets all admin users.' })
  async getAdmins() {
    return (await this.adminService.allAdmins()).map(
      ({ password, ...rest }) => rest,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/api/admin/:id')
  @ApiOperation({ summary: 'Updates an admin user given an id.' })
  async updateAdmin(
    @Param('id') id: number,
    @Body() adminPayload: AdminSaveDto,
  ) {
    const admin = await this.adminService.findOne({ id });

    if (!admin) {
      throw new HttpException('Admin was not found', HttpStatus.NOT_FOUND);
    }

    if (adminPayload.username) {
      admin.username = adminPayload.username;
    }
    if (adminPayload.password) {
      admin.password = adminPayload.password;
    }

    const result = await this.adminService.save(admin);
    delete result.password;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/api/admin/:id')
  @ApiOperation({ summary: 'Deletes an admin user given an id.' })
  async deleteAdmin(@Param('id') id: number): Promise<DeleteResult> {
    const admin = await this.adminService.findOne({ id });

    if (!admin) {
      throw new HttpException('Admin was not found', HttpStatus.NOT_FOUND);
    }

    return await this.adminService.remove(admin);
  }
}
