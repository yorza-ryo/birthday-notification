import Bull from "bull";
import axios from "axios";
import moment from "moment-timezone";
import redisConfig from "../config/redisConfig";
import { Type, User } from "@prisma/client";

const taskQueue = new Bull(process.env.QUEUE_NAME || "scheduled-tasks", {
  redis: redisConfig,
});

async function scheduleTask(userId: string, type: Type, scheduledAt: Date) {
  const now = moment.utc();
  const scheduleTime = moment.tz(scheduledAt, "UTC");

  if (scheduleTime.isBefore(now)) {
    throw new Error("Scheduled time must be in the future.");
  }

  const delay = scheduleTime.diff(now, "milliseconds");

  await taskQueue.add(
    { userId, type },
    {
      delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}

export async function sendEmail(message: string, user: User) {
  try {
    const response = await axios.post(process.env.URL_EMAIL, {
      message,
      to: `${user.firstName} ${user.lastName}`,
    });

    console.log("Res: ", response);

    if (response.status === 200 && response.data.status === "sent") {
      console.log(`Email sent successfully at ${response.data.sentTime}`);
      return { status: "success", sentTime: response.data.sentTime };
    } else {
      console.log(`Unexpected response: ${JSON.stringify(response.data)}`);
      throw new Error("Unexpected response from email service.");
    }
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.error("Invalid input error.");
      throw new Error("Invalid input: Check the request payload.");
    } else if (error.response && error.response.status === 500) {
      console.error("Server error. Retrying...");
      throw new Error("Server error: Retry later.");
    } else if (
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    ) {
      console.error("Request timeout. Retrying...");
      throw new Error("Request timeout.");
    } else {
      console.error("Unexpected error:", error.message);
      throw error;
    }
  }
}

export { taskQueue, scheduleTask };
