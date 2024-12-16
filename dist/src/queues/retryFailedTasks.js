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
exports.retryFailedTasks = retryFailedTasks;
const client_1 = require("@prisma/client");
const bullQueue_1 = require("./bullQueue");
const prisma = new client_1.PrismaClient();
const MAX_RETRIES = 5;
function retryFailedTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Checking for failed tasks to retry...");
        const now = new Date();
        try {
            const failedTasks = yield prisma.scheduledTask.findMany({
                where: {
                    status: client_1.Status.FAILED,
                    retryCount: {
                        lt: MAX_RETRIES,
                    },
                },
            });
            for (const task of failedTasks) {
                try {
                    yield (0, bullQueue_1.scheduleTask)(task.userId, task.type, task.scheduledAt);
                    console.log(`Retrying task ${task.id} successfully requeued.`);
                    yield prisma.scheduledTask.update({
                        where: { id: task.id },
                        data: {
                            status: client_1.Status.PENDING,
                            retryCount: task.retryCount + 1,
                        },
                    });
                }
                catch (error) {
                    console.error(`Failed to requeue task ${task.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error("Error while fetching failed tasks:", error);
        }
    });
}
