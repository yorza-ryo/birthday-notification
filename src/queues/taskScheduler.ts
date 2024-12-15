import { PrismaClient } from "@prisma/client";
import { scheduleTask } from "./bullQueue";

const prisma = new PrismaClient();

export async function schedulePendingTasks() {
  console.log("Checking for pending tasks...");
  const now = new Date();

  try {
    const pendingTasks = await prisma.scheduledTask.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          gte: now,
        },
      },
    });

    for (const task of pendingTasks) {
      try {
        await scheduleTask(task.userId, task.type, task.scheduledAt);
        console.log(`Task ${task.id} scheduled successfully.`);
        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: { status: "SCHEDULED" },
        });
      } catch (error) {
        console.error(`Failed to schedule task ${task.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error while fetching pending tasks:", error);
  }
}
