import Bull from "bull";
import axios from "axios";
import moment from "moment-timezone";
import redisConfig from "../config/redisConfig";

const taskQueue = new Bull(process.env.QUEUE_NAME || "scheduled-tasks", {
  redis: redisConfig,
});

async function scheduleTask(
  userId: string,
  type: "BIRTHDAY" | "ANNIVERSARY",
  scheduledAt: Date
) {
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

export async function sendEmail(message: string, user: any) {
  try {
    const response = await axios.post(
      "https://email-service.digitalenvision.com.au/send",
      {
        message,
        to: `${user.firstName} ${user.lastName}`,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to send email");
  }
}

export { taskQueue, scheduleTask };
