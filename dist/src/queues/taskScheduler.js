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
exports.schedulePendingTasks = schedulePendingTasks;
const client_1 = require("@prisma/client");
const bullQueue_1 = require("./bullQueue");
const prisma = new client_1.PrismaClient();
function schedulePendingTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Checking for pending tasks...");
        const now = new Date();
        try {
            const pendingTasks = yield prisma.scheduledTask.findMany({
                where: {
                    status: client_1.Status.PENDING,
                    scheduledAt: {
                        gte: now,
                    },
                },
            });
            for (const task of pendingTasks) {
                try {
                    yield (0, bullQueue_1.scheduleTask)(task.userId, task.type, task.scheduledAt);
                    console.log(`Task ${task.id} scheduled successfully.`);
                    yield prisma.scheduledTask.update({
                        where: { id: task.id },
                        data: { status: client_1.Status.SCHEDULED },
                    });
                }
                catch (error) {
                    console.error(`Failed to schedule task ${task.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error("Error while fetching pending tasks:", error);
        }
    });
}
