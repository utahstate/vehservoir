import {
  Controller,
  Render,
  Get,
  Post,
  Req,
  Res,
  Body,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { AdminService } from "../providers/services/admin";
import { LoginDto } from "../../dto/admin/Login";

@Controller()
export class AdminController {
  constructor(
    private jwtService: JwtService,
    private adminService: AdminService
  ) {}

  @Render("login")
  @Get("/admin/login")
  public index() {}

  @Post("/admin/login")
  async login(
    @Body() loginPayload: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const userIsAuthenticated = this.adminService.userIsAuthenticated(
      loginPayload.username,
      loginPayload.password
    );

    if (!userIsAuthenticated) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: "Invalid Credentials",
        },
        HttpStatus.FORBIDDEN
      );
    }

    const { password, ...rest } = loginPayload;
    const access_token = this.jwtService.sign(rest);

    res.cookie("jwt", access_token, { httpOnly: true });

    return {
      message: "Login Success.",
      access_token,
    };
  }

  @Post("/admin/logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("jwt");
    return {
      message: "Successfully Logged out...",
    };
  }

  @Render("dashboard")
  @Get("/admin/dashboard")
  async getDashboard(@Req() req: Request) {
    try {
      const access_token = req.cookies["jwt"];
      const data = await this.jwtService.verifyAsync(access_token);

      if (!data) {
        throw new UnauthorizedException();
      }

      return req.user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
