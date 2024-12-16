import { PrismaClient, Status } from "@prisma/client";
import { sendEmail, taskQueue } from "./bullQueue";

const prisma = new PrismaClient();

(async () => {
  console.log("Worker is starting...");

  taskQueue.process(async (job) => {
    const { userId, type } = job.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }

    const message = `Hey, ${user.firstName} ${
      user.lastName
    }, it's your ${type.toLowerCase()}!`;

    try {
      await sendEmail(message, user);

      const task = await prisma.scheduledTask.findFirst({
        where: { userId, type, status: Status.SCHEDULED },
      });

      if (task) {
        await prisma.scheduledTask.updateMany({
          where: { id: task.id },
          data: { status: Status.SENT },
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);

      if (job.attemptsMade >= 3) {
        await prisma.scheduledTask.updateMany({
          where: { userId, type, status: Status.SCHEDULED },
          data: { status: Status.FAILED },
        });
      }

      throw error;
    }
  });

  console.log("Worker is ready to process jobs...");
})();
