import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/user.route";
import cron from "node-cron";
import { schedulePendingTasks } from "./queues/taskScheduler";
import { errorHandler } from "./middlewares/error-handler.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRoutes);

cron.schedule("* * * * *", async () => {
  try {
    await schedulePendingTasks();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
