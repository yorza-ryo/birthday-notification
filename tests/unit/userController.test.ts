import { Request, Response, NextFunction } from "express";
import UserController from "../../src/controllers/user.controller";
import { PrismaClient } from "@prisma/client";
import UserService from "../../src/services/user.service";

jest.mock("../../src/services/user.service");

describe("UserController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let userService: UserService;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    userService = new UserService();
  });

  describe("get()", () => {
    it("should return users", async () => {
      const users = [{ id: "1", name: "Test User" }];

      userService.get = jest.fn().mockResolvedValue(users);

      await UserController.get(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.get).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it("should handle errors", async () => {
      const error = new Error("Something went wrong");
      userService.get = jest.fn().mockRejectedValue(error);

      await UserController.get(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("create()", () => {
    it("should create a user", async () => {
      const user = { id: "1", name: "Test User" };
      mockRequest.body = { name: "Test User" };
      userService.create = jest.fn().mockResolvedValue(user);

      await UserController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it("should handle errors", async () => {
      const error = new Error("Something went wrong");
      userService.create = jest.fn().mockRejectedValue(error);

      await UserController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
