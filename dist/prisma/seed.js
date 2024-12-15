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
const client_1 = require("@prisma/client");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = [
            {
                firstName: "John",
                lastName: "Doe",
                birthDate: new Date("1999-01-01"),
                anniversaryDate: new Date("2020-01-01"),
            },
            {
                firstName: "Jane",
                lastName: "Smith",
                birthDate: new Date("2000-02-20"),
                location: "Australia/Melbourne",
            },
        ];
        for (const userData of users) {
            const user = yield prisma.user.create({
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    birthDate: userData.birthDate,
                    anniversaryDate: userData.anniversaryDate,
                    location: userData.location || "Asia/Jakarta",
                },
            });
            const currentYear = new Date().getFullYear();
            if (user.birthDate) {
                let scheduledAt = (0, moment_timezone_1.default)(user.birthDate).tz(user.location, true);
                scheduledAt.set("year", currentYear);
                scheduledAt.set("hour", 9).set("minute", 0).set("second", 0);
                if (scheduledAt.isBefore((0, moment_timezone_1.default)())) {
                    scheduledAt.set("year", currentYear + 1);
                }
                yield prisma.scheduledTask.create({
                    data: {
                        userId: user.id,
                        type: client_1.Type.BIRTHDAY,
                        status: client_1.Status.PENDING,
                        scheduledAt: scheduledAt.toDate(),
                    },
                });
            }
            if (user.anniversaryDate) {
                let scheduledAt = (0, moment_timezone_1.default)(user.anniversaryDate).tz(user.location, true);
                scheduledAt.set("year", currentYear);
                scheduledAt.set("hour", 9).set("minute", 0).set("second", 0);
                if (scheduledAt.isBefore((0, moment_timezone_1.default)())) {
                    scheduledAt.set("year", currentYear + 1);
                }
                yield prisma.scheduledTask.create({
                    data: {
                        userId: user.id,
                        type: client_1.Type.ANNIVERSARY,
                        status: client_1.Status.PENDING,
                        scheduledAt: scheduledAt.toDate(),
                    },
                });
            }
        }
        console.log("Users and ScheduledTasks seeded successfully!");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
