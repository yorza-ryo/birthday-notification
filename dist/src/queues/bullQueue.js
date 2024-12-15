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
exports.taskQueue = void 0;
exports.sendEmail = sendEmail;
exports.scheduleTask = scheduleTask;
const bull_1 = __importDefault(require("bull"));
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const redisConfig_1 = __importDefault(require("../config/redisConfig"));
const taskQueue = new bull_1.default(process.env.QUEUE_NAME || "scheduled-tasks", {
    redis: redisConfig_1.default,
});
exports.taskQueue = taskQueue;
function scheduleTask(userId, type, scheduledAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = moment_timezone_1.default.utc();
        const scheduleTime = moment_timezone_1.default.tz(scheduledAt, "UTC");
        if (scheduleTime.isBefore(now)) {
            throw new Error("Scheduled time must be in the future.");
        }
        const delay = scheduleTime.diff(now, "milliseconds");
        yield taskQueue.add({ userId, type }, {
            delay,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        });
    });
}
function sendEmail(message, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("https://email-service.digitalenvision.com.au/send", {
                message,
                to: `${user.firstName} ${user.lastName}`,
            });
            return response.data;
        }
        catch (error) {
            console.error("Error details:", error.response ? error.response.data : error.message);
            throw new Error("Failed to send email");
        }
    });
}
