"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUpdateSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    location: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().min(1, "Birth date is required").date(),
    anniversaryDate: zod_1.z.string().date().optional(),
});
exports.userUpdateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    location: zod_1.z.string().min(1).optional(),
    birthDate: zod_1.z.string().date().optional(),
    anniversaryDate: zod_1.z.string().date().optional(),
});
