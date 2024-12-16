import Bull from "bull";
import axios from "axios";
import { sendEmail, scheduleTask } from "../../src/queues/bullQueue";
import { Type } from "@prisma/client";

jest.mock("axios");

describe("Bull Queue", () => {
  const mockQueue = new Bull("test-queue");
  const mockAdd = jest.spyOn(mockQueue, "add");

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should schedule a task in the future", async () => {
    const userId = "test-user-id";
    const type = Type.BIRTHDAY;
    const scheduledAt = new Date(Date.now() + 10000);

    await scheduleTask(userId, type, scheduledAt);

    expect(mockAdd).toHaveBeenCalledWith(
      { userId, type },
      expect.objectContaining({
        delay: expect.any(Number),
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      })
    );
  });

  it("should throw an error if scheduledAt is in the past", async () => {
    const userId = "test-user-id";
    const type = Type.BIRTHDAY;
    const scheduledAt = new Date(Date.now() - 10000);

    await expect(scheduleTask(userId, type, scheduledAt)).rejects.toThrow(
      "Scheduled time must be in the future."
    );
  });

  it("should send an email successfully", async () => {
    const mockUser = { firstName: "John", lastName: "Doe" };
    const mockMessage = "Hello, John Doe!";

    (axios.post as jest.Mock).mockResolvedValue({
      status: 200,
      data: { status: "sent", sentTime: "2024-12-016T10:48:00.000Z" },
    });

    const result = await sendEmail(mockMessage, mockUser as any);

    expect(result.status).toBe("success");
    expect(axios.post).toHaveBeenCalledWith(process.env.URL_EMAIL, {
      message: mockMessage,
      to: "John Doe",
    });
  });

  it("should retry on server errors", async () => {
    const mockUser = { firstName: "John", lastName: "Doe" };
    const mockMessage = "Hello, John Doe!";

    (axios.post as jest.Mock).mockRejectedValueOnce({
      response: { status: 500 },
    });

    (axios.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { status: "sent", sentTime: "2024-12-16T10:48:00.000Z" },
    });

    const result = await sendEmail(mockMessage, mockUser as any);

    expect(result.status).toBe("success");
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
