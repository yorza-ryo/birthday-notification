import request from "supertest";
import app from "../../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.user.deleteMany();
});

describe("User Routes", () => {
  let userId: string;

  it("should create a user", async () => {
    const res = await request(app).post("/api/users").send({
      firstName: "John",
      lastName: "Doe",
      birthDate: "1990-01-01",
      location: "Asia/Jakarta",
    });

    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe("John");
    userId = res.body.id;
  });

  it("should update a user", async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}`)
      .send({ location: "America/New_York" });

    expect(res.status).toBe(200);
    expect(res.body.location).toBe("America/New_York");
  });

  it("should delete a user", async () => {
    const res = await request(app).delete(`/api/users/${userId}`);

    expect(res.status).toBe(204);
  });
});
