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
const bullQueue_1 = require("../../src/queues/bullQueue");
const client_1 = require("@prisma/client");
require("../../src/queues/worker");
jest.mock("@prisma/client");
jest.mock("../../src/queues/bullQueue");
const prisma = new client_1.PrismaClient();
describe("Worker", () => {
    const mockFindUnique = jest.spyOn(prisma.user, "findUnique");
    const mockFindFirst = jest.spyOn(prisma.scheduledTask, "findFirst");
    const mockUpdateMany = jest.spyOn(prisma.scheduledTask, "updateMany");
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should process a job and mark as SENT", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { id: "user-1", firstName: "John", lastName: "Doe" };
        const mockTask = { id: "1", userId: "user-1", type: client_1.Type.BIRTHDAY };
        mockFindUnique.mockResolvedValue(mockUser);
        mockFindFirst.mockResolvedValue(mockTask);
        yield bullQueue_1.taskQueue.process((job) => {
            expect(job.data).toMatchObject({
                userId: mockUser.id,
                type: client_1.Type.BIRTHDAY,
            });
        });
        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { id: mockTask.id },
            data: { status: client_1.Status.SENT },
        });
    }));
    it("should handle retries and mark as FAILED", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockTask = { id: "1", userId: "user-1", type: client_1.Type.BIRTHDAY };
        mockFindUnique.mockResolvedValue(null);
        mockFindFirst.mockResolvedValue(mockTask);
        yield bullQueue_1.taskQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
            expect(job.data).toMatchObject({ userId: "user-1", type: client_1.Type.BIRTHDAY });
            throw new Error("Simulated failure");
        }));
        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { userId: "user-1", type: client_1.Type.BIRTHDAY, status: client_1.Status.PENDING },
            data: { status: client_1.Status.FAILED },
        });
    }));
});
