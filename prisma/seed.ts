import { PrismaClient, Type, Status } from "@prisma/client";
import moment from "moment-timezone";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      firstName: "John",
      lastName: "Doe",
      birthDate: new Date("1999-01-01"),
      anniversaryDate: new Date("2020-01-01"),
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      birthDate: new Date("2000-02-20"),
      location: "Australia/Melbourne",
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
        anniversaryDate: userData.anniversaryDate,
        location: userData.location || "Asia/Jakarta",
      },
    });

    const currentYear = new Date().getFullYear();

    if (user.birthDate) {
      let scheduledAt = moment(user.birthDate).tz(user.location!, true);
      scheduledAt.set("year", currentYear);

      scheduledAt.set("hour", 9).set("minute", 0).set("second", 0);

      if (scheduledAt.isBefore(moment())) {
        scheduledAt.set("year", currentYear + 1);
      }

      await prisma.scheduledTask.create({
        data: {
          userId: user.id,
          type: Type.BIRTHDAY,
          status: Status.PENDING,
          scheduledAt: scheduledAt.toDate(),
        },
      });
    }

    if (user.anniversaryDate) {
      let scheduledAt = moment(user.anniversaryDate).tz(user.location!, true);
      scheduledAt.set("year", currentYear);

      scheduledAt.set("hour", 9).set("minute", 0).set("second", 0);

      if (scheduledAt.isBefore(moment())) {
        scheduledAt.set("year", currentYear + 1);
      }

      await prisma.scheduledTask.create({
        data: {
          userId: user.id,
          type: Type.ANNIVERSARY,
          status: Status.PENDING,
          scheduledAt: scheduledAt.toDate(),
        },
      });
    }
  }

  console.log("Users and ScheduledTasks seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
