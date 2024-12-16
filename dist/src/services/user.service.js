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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const prisma = new client_1.PrismaClient();
class UserService {
    constructor() {
        this.get = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.user.findMany();
            }
            catch (error) {
                throw error;
            }
        });
        this.create = (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { birthDate, anniversaryDate, location } = data, userData = __rest(data, ["birthDate", "anniversaryDate", "location"]);
                const parsedBirthDate = (0, moment_timezone_1.default)(birthDate).toDate();
                const parsedAnniversaryDate = anniversaryDate
                    ? (0, moment_timezone_1.default)(anniversaryDate).toDate()
                    : undefined;
                return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const user = yield tx.user.create({
                        data: Object.assign(Object.assign({}, userData), { location, birthDate: parsedBirthDate, anniversaryDate: parsedAnniversaryDate }),
                    });
                    const tasks = [];
                    const timezone = location || "UTC";
                    const currentYear = new Date().getFullYear();
                    if (birthDate) {
                        tasks.push({
                            type: client_1.Type.BIRTHDAY,
                            status: client_1.Status.PENDING,
                            scheduledAt: moment_timezone_1.default
                                .tz(birthDate, timezone)
                                .set("year", currentYear)
                                .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
                                .toDate(),
                            user: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        });
                    }
                    if (anniversaryDate) {
                        tasks.push({
                            type: client_1.Type.ANNIVERSARY,
                            status: client_1.Status.PENDING,
                            scheduledAt: moment_timezone_1.default
                                .tz(anniversaryDate, timezone)
                                .set("year", currentYear)
                                .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
                                .toDate(),
                            user: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        });
                    }
                    if (tasks.length > 0) {
                        for (const task of tasks) {
                            yield tx.scheduledTask.create({
                                data: task,
                            });
                        }
                    }
                    return user;
                }));
            }
            catch (error) {
                throw error;
            }
        });
        this.update = (id, data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma.user.findUnique({
                    where: { id },
                    select: { location: true, birthDate: true, anniversaryDate: true },
                });
                if (!user)
                    throw new Error("User not found!");
                const updateData = Object.assign(Object.assign({}, data), { location: data.location || user.location });
                const parsedBirthDate = data.birthDate
                    ? (0, moment_timezone_1.default)(data.birthDate).toDate()
                    : undefined;
                const parsedAnniversaryDate = data.anniversaryDate
                    ? (0, moment_timezone_1.default)(data.anniversaryDate).toDate()
                    : undefined;
                if (parsedBirthDate)
                    updateData.birthDate = parsedBirthDate;
                if (parsedAnniversaryDate)
                    updateData.anniversaryDate = parsedAnniversaryDate;
                return yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedUser = yield tx.user.update({
                        where: { id },
                        data: updateData,
                    });
                    const tasks = [];
                    if (parsedBirthDate) {
                        tasks.push(this.upsertScheduledTask(tx, id, client_1.Type.BIRTHDAY, parsedBirthDate, updateData.location));
                    }
                    if (parsedAnniversaryDate) {
                        tasks.push(this.upsertScheduledTask(tx, id, client_1.Type.ANNIVERSARY, parsedAnniversaryDate, updateData.location));
                    }
                    yield Promise.all(tasks);
                    return updatedUser;
                }));
            }
            catch (error) {
                console.error("Error updating user and scheduled tasks:", error);
                throw error;
            }
        });
        this.upsertScheduledTask = (tx, userId, type, date, location) => __awaiter(this, void 0, void 0, function* () {
            const scheduledAt = (0, moment_timezone_1.default)(date)
                .tz(location, true)
                .set("year", new Date().getFullYear())
                .set("hour", 9)
                .set("minute", 0)
                .set("second", 0);
            if (scheduledAt.isBefore((0, moment_timezone_1.default)())) {
                scheduledAt.set("year", new Date().getFullYear() + 1);
            }
            return tx.scheduledTask.upsert({
                where: { userId_type: { userId, type } },
                update: { scheduledAt: scheduledAt.toDate() },
                create: {
                    type,
                    status: client_1.Status.PENDING,
                    scheduledAt: scheduledAt.toDate(),
                    user: { connect: { id: userId } },
                },
            });
        });
        this.remove = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.user.delete({
                    where: { id },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = UserService;
