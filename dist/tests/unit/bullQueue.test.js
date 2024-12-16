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
const bull_1 = __importDefault(require("bull"));
const axios_1 = __importDefault(require("axios"));
const bullQueue_1 = require("../../src/queues/bullQueue");
const client_1 = require("@prisma/client");
jest.mock("axios");
describe("Bull Queue", () => {
    const mockQueue = new bull_1.default("test-queue");
    const mockAdd = jest.spyOn(mockQueue, "add");
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should schedule a task in the future", () => __awaiter(void 0, void 0, void 0, function* () {
        const userId = "test-user-id";
        const type = client_1.Type.BIRTHDAY;
        const scheduledAt = new Date(Date.now() + 10000);
        yield (0, bullQueue_1.scheduleTask)(userId, type, scheduledAt);
        expect(mockAdd).toHaveBeenCalledWith({ userId, type }, expect.objectContaining({
            delay: expect.any(Number),
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        }));
    }));
    it("should throw an error if scheduledAt is in the past", () => __awaiter(void 0, void 0, void 0, function* () {
        const userId = "test-user-id";
        const type = client_1.Type.BIRTHDAY;
        const scheduledAt = new Date(Date.now() - 10000);
        yield expect((0, bullQueue_1.scheduleTask)(userId, type, scheduledAt)).rejects.toThrow("Scheduled time must be in the future.");
    }));
    it("should send an email successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { firstName: "John", lastName: "Doe" };
        const mockMessage = "Hello, John Doe!";
        axios_1.default.post.mockResolvedValue({
            status: 200,
            data: { status: "sent", sentTime: "2024-12-016T10:48:00.000Z" },
        });
        const result = yield (0, bullQueue_1.sendEmail)(mockMessage, mockUser);
        expect(result.status).toBe("success");
        expect(axios_1.default.post).toHaveBeenCalledWith(process.env.URL_EMAIL, {
            message: mockMessage,
            to: "John Doe",
        });
    }));
    it("should retry on server errors", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { firstName: "John", lastName: "Doe" };
        const mockMessage = "Hello, John Doe!";
        axios_1.default.post.mockRejectedValueOnce({
            response: { status: 500 },
        });
        axios_1.default.post.mockResolvedValueOnce({
            status: 200,
            data: { status: "sent", sentTime: "2024-12-16T10:48:00.000Z" },
        });
        const result = yield (0, bullQueue_1.sendEmail)(mockMessage, mockUser);
        expect(result.status).toBe("success");
        expect(axios_1.default.post).toHaveBeenCalledTimes(2);
    }));
});
