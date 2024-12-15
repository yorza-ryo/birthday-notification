import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { userCreateSchema, userUpdateSchema } from "../schemas/user.schema";

const router = Router();

router.get("/", userController.get);
router.post("/", validate(userCreateSchema), userController.create);
router.patch("/:id", validate(userUpdateSchema), userController.update);
router.delete("/:id", userController.remove);

export default router;
