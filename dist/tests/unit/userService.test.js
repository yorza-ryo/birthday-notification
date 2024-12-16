"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../../src/services/user.service"));
const prisma_1 = require("../__mocks__/prisma");
describe("UserService", () => {
    let userService;
    beforeEach(() => {
        userService = new user_service_1.default();
    });
    describe("get()", () => {
        it("should return users", () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [
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
            prisma_1.prismaMock.user.findMany.mockResolvedValue(users);
            const result = yield userService.get();
            expect(result).toEqual(users);
            expect(prisma_1.prismaMock.user.findMany).toHaveBeenCalled();
        }));
        it("should throw an error if something goes wrong", () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error("Database error");
            prisma_1.prismaMock.user.findMany.mockRejectedValue(error);
            yield expect(userService.get()).rejects.toThrowError(error);
        }));
    });
    describe("create()", () => {
        it("should create a user", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = {
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
            prisma_1.prismaMock.user.create.mockResolvedValue(user);
            const result = yield userService.create(data);
            expect(result).toEqual(user);
            expect(prisma_1.prismaMock.user.create).toHaveBeenCalledWith({ data });
        }));
        it("should throw an error if creation fails", () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error("Failed to create user");
            prisma_1.prismaMock.user.create.mockRejectedValue(error);
            yield expect(userService.create({
                firstName: "Test",
                lastName: "User",
                birthDate: new Date(),
                location: "Asia/Jakarta",
                anniversaryDate: null,
            })).rejects.toThrowError(error);
        }));
    });
});
