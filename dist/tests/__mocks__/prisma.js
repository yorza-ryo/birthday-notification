"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
exports.prismaMock = {
    user: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    $transaction: jest.fn(),
};
jest.mock("@prisma/client", () => {
    return {
        PrismaClient: jest.fn(() => exports.prismaMock),
    };
});
