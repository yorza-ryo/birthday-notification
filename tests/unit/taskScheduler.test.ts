import { PrismaClient, Status, Type } from "@prisma/client";
import { schedulePendingTasks } from "../../src/queues/taskScheduler";
import { scheduleTask } from "../../src/queues/bullQueue";

jest.mock("@prisma/client");
jest.mock("../../src/queues/bullQueue");

const prisma = new PrismaClient();

describe("Task Scheduler", () => {
  const mockFindMany = jest.spyOn(prisma.scheduledTask, "findMany");
  const mockUpdate = jest.spyOn(prisma.scheduledTask, "update");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule pending tasks", async () => {
    const mockTasks = [
      {
        id: "1",
        userId: "user1",
        type: Type.BIRTHDAY,
        scheduledAt: new Date(),
        status: Status.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        retryCount: 0,
      },
    ];

    mockFindMany.mockResolvedValue(mockTasks);

    await schedulePendingTasks();

    expect(scheduleTask).toHaveBeenCalledWith(
      mockTasks[0].userId,
      mockTasks[0].type,
      mockTasks[0].scheduledAt
    );

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockTasks[0].id },
      data: { status: Status.SCHEDULED },
    });
  });

  it("should handle errors while scheduling", async () => {
    mockFindMany.mockResolvedValue([]);
    await expect(schedulePendingTasks()).resolves.not.toThrow();
  });
});
