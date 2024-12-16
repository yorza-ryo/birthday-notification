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
const user_controller_1 = __importDefault(require("../../src/controllers/user.controller"));
const user_service_1 = __importDefault(require("../../src/services/user.service"));
jest.mock("../../src/services/user.service");
describe("UserController", () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let userService;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        userService = new user_service_1.default();
    });
    describe("get()", () => {
        it("should return users", () => __awaiter(void 0, void 0, void 0, function* () {
            const users = [{ id: "1", name: "Test User" }];
            userService.get = jest.fn().mockResolvedValue(users);
            yield user_controller_1.default.get(mockRequest, mockResponse, mockNext);
            expect(userService.get).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(users);
        }));
        it("should handle errors", () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error("Something went wrong");
            userService.get = jest.fn().mockRejectedValue(error);
            yield user_controller_1.default.get(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        }));
    });
    describe("create()", () => {
        it("should create a user", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = { id: "1", name: "Test User" };
            mockRequest.body = { name: "Test User" };
            userService.create = jest.fn().mockResolvedValue(user);
            yield user_controller_1.default.create(mockRequest, mockResponse, mockNext);
            expect(userService.create).toHaveBeenCalledWith(mockRequest.body);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(user);
        }));
        it("should handle errors", () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error("Something went wrong");
            userService.create = jest.fn().mockRejectedValue(error);
            yield user_controller_1.default.create(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        }));
    });
});
