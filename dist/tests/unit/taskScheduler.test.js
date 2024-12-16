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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const taskScheduler_1 = require("../../src/queues/taskScheduler");
const bullQueue_1 = require("../../src/queues/bullQueue");
jest.mock("@prisma/client");
jest.mock("../../src/queues/bullQueue");
const prisma = new client_1.PrismaClient();
describe("Task Scheduler", () => {
    const mockFindMany = jest.spyOn(prisma.scheduledTask, "findMany");
    const mockUpdate = jest.spyOn(prisma.scheduledTask, "update");
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should schedule pending tasks", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockTasks = [
            {
                id: "1",
                userId: "user1",
                type: client_1.Type.BIRTHDAY,
                scheduledAt: new Date(),
                status: client_1.Status.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                retryCount: 0,
            },
        ];
        mockFindMany.mockResolvedValue(mockTasks);
        yield (0, taskScheduler_1.schedulePendingTasks)();
        expect(bullQueue_1.scheduleTask).toHaveBeenCalledWith(mockTasks[0].userId, mockTasks[0].type, mockTasks[0].scheduledAt);
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: mockTasks[0].id },
            data: { status: client_1.Status.SCHEDULED },
        });
    }));
    it("should handle errors while scheduling", () => __awaiter(void 0, void 0, void 0, function* () {
        mockFindMany.mockResolvedValue([]);
        yield expect((0, taskScheduler_1.schedulePendingTasks)()).resolves.not.toThrow();
    }));
});
