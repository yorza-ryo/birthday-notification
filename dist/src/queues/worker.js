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
const bullQueue_1 = require("./bullQueue");
const prisma = new client_1.PrismaClient();
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Worker is starting...");
    bullQueue_1.taskQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
        const { userId, type } = job.data;
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            console.error(`User with ID ${userId} not found.`);
            return;
        }
        const message = `Hey, ${user.firstName} ${user.lastName}, it's your ${type.toLowerCase()}!`;
        try {
            yield (0, bullQueue_1.sendEmail)(message, user);
            const task = yield prisma.scheduledTask.findFirst({
                where: { userId, type, status: client_1.Status.SCHEDULED },
            });
            if (task) {
                yield prisma.scheduledTask.updateMany({
                    where: { id: task.id },
                    data: { status: client_1.Status.SENT },
                });
            }
        }
        catch (error) {
            console.error("Error sending email:", error);
            if (job.attemptsMade >= 3) {
                yield prisma.scheduledTask.updateMany({
                    where: { userId, type, status: client_1.Status.SCHEDULED },
                    data: { status: client_1.Status.FAILED },
                });
            }
            throw error;
        }
    }));
    console.log("Worker is ready to process jobs...");
}))();
