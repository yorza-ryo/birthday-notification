import { taskQueue } from "../../src/queues/bullQueue";
import { PrismaClient, Type, Status } from "@prisma/client";
import "../../src/queues/worker";

const prisma = new PrismaClient();

describe("Worker Integration", () => {
  it("should process a real job and mark as SENT", async () => {
    const mockTask = await prisma.scheduledTask.create({
      data: {
        userId: "test-user",
        type: Type.BIRTHDAY,
        scheduledAt: new Date(),
        status: Status.PENDING,
      },
    });

    await taskQueue.add({ userId: mockTask.userId, type: mockTask.type });

    const processedTask = await prisma.scheduledTask.findUnique({
      where: { id: mockTask.id },
    });

    expect(processedTask?.status).toBe("SENT");
  });
});
