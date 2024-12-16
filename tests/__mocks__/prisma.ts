import { PrismaClient } from "@prisma/client";

export const prismaMock = {
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
    PrismaClient: jest.fn(() => prismaMock),
  };
});
