import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";

import { AdminService } from "../providers/services/admin";
import { AdminController } from "./admin";
import { LoginDto } from "../../dto/admin/Login";

import type { Response } from "express";
import * as bcrypt from "bcrypt";

const adminServiceMocks = {
  userIsAuthenticated: async (
    username: string,
    rawPassword: string
  ): Promise<boolean | null> => {
    const hashedPassword = await bcrypt.hash("test123!", 10);
    if (
      (await bcrypt.compare(rawPassword, hashedPassword)) &&
      username.toLowerCase() === "admin-account"
    ) {
      return true;
    }
    return false;
  },
};

describe("AdminController", () => {
  let adminController: AdminController;
  let responseObject = {
    cookie: "thisisacookie",
  };

  const response: Partial<Response> = {
    json: jest.fn().mockImplementation().mockReturnValue(responseObject),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "secret" })],
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: adminServiceMocks,
        },
      ],
    }).compile();

    adminController = testingModule.get<AdminController>(AdminController);
  });

  describe("login", () => {
    const payload: LoginDto = {
      username: "admin-account",
      password: "test123!",
    };
    // it("should log the user in provided the correct credentials.", async () => {
    //   expect(
    //     await adminController.login(payload, response as Response)
    //   ).toEqual({ message: "Login Success!" });
    // });
  });
});
