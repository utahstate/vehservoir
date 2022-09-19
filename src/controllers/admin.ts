import {
  Controller,
  Render,
  Get,
  Post,
  Req,
  Res,
  Request,
  UseGuards,
  Body,
} from "@nestjs/common";
import { AdminService } from "../providers/services/admin";
import { AuthService } from "../providers/services/auth";
import { LocalAuthGuard } from "../auth/local-auth.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { RenderableResponse } from "nest-next";
import { AdminRegistrationDto } from "../../dto/admin/Register";

@Controller()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  @Get("/admin/login")
  public loginForm(@Res() res: RenderableResponse) {
    res.render("login", {
      title: "Login",
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post("/admin/login")
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Render("register")
  @Get("/admin/register")
  public registerForm() {}

  @Post("/admin/register")
  async register(@Body() adminRegistrationDto: AdminRegistrationDto) {
    const admin = await this.adminService.create(adminRegistrationDto);

    const { password, ...rest } = admin;

    return rest;
  }

  // @UseGuards(JwtAuthGuard)
  // @Post("/admin/remove")
  // async remove(@Body() adminId: number) {
  //   const admin = await this.adminService.remove({ adminId });

  //   const { password, ...rest } = admin;

  //   return rest;
  // }

  // @Post("/admin/logout")
  // async logout(@Res({ passthrough: true }) res: Response) {
  //   res.clearCookie("jwt");
  //   return {
  //     message: "Successfully Logged out.",
  //   };
  // }

  // @UseGuards(JwtAuthGuard)
  @Get("/admin/dashboard")
  async getDashboard(@Request() req: any, @Res() res: RenderableResponse) {
    res.render("dashboard", req.user);
    // const access_token = req.cookies["jwt"];
    // const data = await this.jwtService.verifyAsync(access_token);

    // if (!data) {
    //   throw new UnauthorizedException();
    // }

    // const admin = await this.adminService.findOne({ id: data["id"] });
    // const { password, ...rest } = admin;

    // return rest;
    return req.user;
  }

  @Get("/admin/vehicles")
  async getVehicles(@Res() res: RenderableResponse) {
    res.render("vehicles");
  }
}
