import { taskQueue } from "../../src/queues/bullQueue";
import { PrismaClient, Status, Type } from "@prisma/client";
import "../../src/queues/worker";

jest.mock("@prisma/client");
jest.mock("../../src/queues/bullQueue");

const prisma = new PrismaClient();

describe("Worker", () => {
  const mockFindUnique = jest.spyOn(prisma.user, "findUnique");
  const mockFindFirst = jest.spyOn(prisma.scheduledTask, "findFirst");
  const mockUpdateMany = jest.spyOn(prisma.scheduledTask, "updateMany");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should process a job and mark as SENT", async () => {
    const mockUser = { id: "user-1", firstName: "John", lastName: "Doe" };
    const mockTask = { id: "1", userId: "user-1", type: Type.BIRTHDAY };

    mockFindUnique.mockResolvedValue(mockUser as any);
    mockFindFirst.mockResolvedValue(mockTask as any);

    await taskQueue.process((job) => {
      expect(job.data).toMatchObject({
        userId: mockUser.id,
        type: Type.BIRTHDAY,
      });
    });

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: mockTask.id },
      data: { status: Status.SENT },
    });
  });

  it("should handle retries and mark as FAILED", async () => {
    const mockTask = { id: "1", userId: "user-1", type: Type.BIRTHDAY };

    mockFindUnique.mockResolvedValue(null);
    mockFindFirst.mockResolvedValue(mockTask as any);

    await taskQueue.process(async (job) => {
      expect(job.data).toMatchObject({ userId: "user-1", type: Type.BIRTHDAY });
      throw new Error("Simulated failure");
    });

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", type: Type.BIRTHDAY, status: Status.PENDING },
      data: { status: Status.FAILED },
    });
  });
});
