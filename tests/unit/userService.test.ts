import { PrismaClient, User } from "@prisma/client";
import UserService from "../../src/services/user.service";
import { prismaMock } from "../__mocks__/prisma";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("get()", () => {
    it("should return users", async () => {
      const users: User[] = [
        {
          id: "1",
          firstName: "Test",
          lastName: "User",
          birthDate: new Date(),
          location: "Asia/Jakarta",
          anniversaryDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(users);

      const result = await userService.get();
      expect(result).toEqual(users);
      expect(prismaMock.user.findMany).toHaveBeenCalled();
    });

    it("should throw an error if something goes wrong", async () => {
      const error = new Error("Database error");

      prismaMock.user.findMany.mockRejectedValue(error);

      await expect(userService.get()).rejects.toThrowError(error);
    });
  });

  describe("create()", () => {
    it("should create a user", async () => {
      const user: User = {
        id: "1",
        firstName: "Test",
        lastName: "User",
        birthDate: new Date(),
        location: "Asia/Jakarta",
        anniversaryDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const data = {
        firstName: "Test",
        lastName: "User",
        birthDate: new Date(),
        location: "Asia/Jakarta",
        anniversaryDate: null,
      };

      prismaMock.user.create.mockResolvedValue(user);

      const result = await userService.create(data);
      expect(result).toEqual(user);
      expect(prismaMock.user.create).toHaveBeenCalledWith({ data });
    });

    it("should throw an error if creation fails", async () => {
      const error = new Error("Failed to create user");

      prismaMock.user.create.mockRejectedValue(error);

      await expect(
        userService.create({
          firstName: "Test",
          lastName: "User",
          birthDate: new Date(),
          location: "Asia/Jakarta",
          anniversaryDate: null,
        })
      ).rejects.toThrowError(error);
    });
  });
});
