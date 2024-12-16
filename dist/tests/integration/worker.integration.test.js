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
const prisma = new client_1.PrismaClient();
describe("Worker Integration", () => {
    it("should process a real job and mark as SENT", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockTask = yield prisma.scheduledTask.create({
            data: {
                userId: "test-user",
                type: client_1.Type.BIRTHDAY,
                scheduledAt: new Date(),
                status: client_1.Status.PENDING,
            },
        });
        yield bullQueue_1.taskQueue.add({ userId: mockTask.userId, type: mockTask.type });
        const processedTask = yield prisma.scheduledTask.findUnique({
            where: { id: mockTask.id },
        });
        expect(processedTask === null || processedTask === void 0 ? void 0 : processedTask.status).toBe("SENT");
    }));
});
