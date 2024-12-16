import { PrismaClient, Status } from "@prisma/client";
import { scheduleTask } from "./bullQueue";

const prisma = new PrismaClient();

const MAX_RETRIES = 5;

export async function retryFailedTasks() {
  console.log("Checking for failed tasks to retry...");
  const now = new Date();

  try {
    const failedTasks = await prisma.scheduledTask.findMany({
      where: {
        status: Status.FAILED,
        retryCount: {
          lt: MAX_RETRIES,
        },
      },
    });

    for (const task of failedTasks) {
      try {
        await scheduleTask(task.userId, task.type, task.scheduledAt);
        console.log(`Retrying task ${task.id} successfully requeued.`);

        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            status: Status.PENDING,
            retryCount: task.retryCount + 1,
          },
        });
      } catch (error) {
        console.error(`Failed to requeue task ${task.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error while fetching failed tasks:", error);
  }
}
