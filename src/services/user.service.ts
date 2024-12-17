import { Prisma, PrismaClient, User, Type, Status } from "@prisma/client";
import moment from "moment-timezone";
import { taskQueue } from "../queues/bullQueue";

const prisma = new PrismaClient();

class UserService {
  public get = async (): Promise<User[]> => {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      throw error;
    }
  };

  public create = async (data: Prisma.UserCreateInput) => {
    try {
      const { birthDate, anniversaryDate, location, ...userData } = data;

      const parsedBirthDate = moment(birthDate).toDate();
      const parsedAnniversaryDate = anniversaryDate
        ? moment(anniversaryDate).toDate()
        : undefined;

      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            ...userData,
            location,
            birthDate: parsedBirthDate,
            anniversaryDate: parsedAnniversaryDate,
          },
        });

        const tasks: Prisma.ScheduledTaskCreateInput[] = [];
        const timezone = location || "UTC";
        const currentYear = new Date().getFullYear();

        if (birthDate) {
          tasks.push({
            type: Type.BIRTHDAY,
            status: Status.PENDING,
            scheduledAt: moment
              .tz(birthDate, timezone)
              .set("year", currentYear)
              .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
              .toDate(),
            user: {
              connect: {
                id: user.id,
              },
            },
          });
        }

        if (anniversaryDate) {
          tasks.push({
            type: Type.ANNIVERSARY,
            status: Status.PENDING,
            scheduledAt: moment
              .tz(anniversaryDate, timezone)
              .set("year", currentYear)
              .set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
              .toDate(),
            user: {
              connect: {
                id: user.id,
              },
            },
          });
        }

        if (tasks.length > 0) {
          for (const task of tasks) {
            await tx.scheduledTask.create({
              data: task,
            });
          }
        }

        return user;
      });
    } catch (error) {
      throw error;
    }
  };

  public update = async (id: string, data: Prisma.UserUpdateInput) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { location: true, birthDate: true, anniversaryDate: true },
      });

      if (!user) throw new Error("User not found!");

      const updateData: Prisma.UserUpdateInput = {
        ...data,
        location: data.location || user.location,
      };

      const parsedBirthDate = data.birthDate
        ? moment(data.birthDate as string).toDate()
        : undefined;
      const parsedAnniversaryDate = data.anniversaryDate
        ? moment(data.anniversaryDate as string).toDate()
        : undefined;

      if (parsedBirthDate) updateData.birthDate = parsedBirthDate;
      if (parsedAnniversaryDate)
        updateData.anniversaryDate = parsedAnniversaryDate;

      return await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id },
          data: updateData,
        });

        const tasks = [];
        if (parsedBirthDate) {
          tasks.push(
            this.upsertScheduledTask(
              tx,
              id,
              Type.BIRTHDAY,
              parsedBirthDate,
              updateData.location as string
            )
          );
        }
        if (parsedAnniversaryDate) {
          tasks.push(
            this.upsertScheduledTask(
              tx,
              id,
              Type.ANNIVERSARY,
              parsedAnniversaryDate,
              updateData.location as string
            )
          );
        }

        await Promise.all(tasks);

        return updatedUser;
      });
    } catch (error) {
      console.error("Error updating user and scheduled tasks:", error);
      throw error;
    }
  };

  private upsertScheduledTask = async (
    tx: Prisma.TransactionClient,
    userId: string,
    type: Type,
    date: Date,
    location: string
  ) => {
    const scheduledAt = moment(date)
      .tz(location, true)
      .set("year", new Date().getFullYear())
      .set("hour", 9)
      .set("minute", 0)
      .set("second", 0);

    if (scheduledAt.isBefore(moment())) {
      scheduledAt.set("year", new Date().getFullYear() + 1);
    }

    const jobId = `${userId}-${type}`;
    const existingJob = await taskQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`Removed old job from Redis queue: ${jobId}`);
    }

    const dbTask = await tx.scheduledTask.upsert({
      where: { userId_type: { userId, type } },
      update: { scheduledAt: scheduledAt.toDate() },
      create: {
        type,
        status: Status.PENDING,
        scheduledAt: scheduledAt.toDate(),
        user: { connect: { id: userId } },
      },
    });

    await taskQueue.add(
      { userId, type, scheduledAt: scheduledAt.toISOString() },
      {
        jobId,
        delay: scheduledAt.diff(moment()),
      }
    );

    console.log(`Scheduled task added/updated in Redis queue: ${jobId}`);

    return dbTask;
  };

  public remove = async (id: string) => {
    try {
      const scheduledTasks = await prisma.scheduledTask.findMany({
        where: { userId: id },
        select: { id: true, type: true },
      });

      await prisma.user.delete({
        where: { id },
      });

      const removeJobs = scheduledTasks.map(async (task) => {
        const jobName = `${task.type}_${task.id}`;
        const jobs = await taskQueue.getJobs(["delayed", "waiting", "active"]);

        for (const job of jobs) {
          if (job.name === jobName) {
            await job.remove();
          }
        }
      });

      await Promise.all(removeJobs);

      return { message: "User and associated tasks deleted successfully" };
    } catch (error) {
      console.error("Error removing user and tasks:", error);
      throw new Error("Failed to remove user and tasks");
    }
  };
}

export default UserService;
