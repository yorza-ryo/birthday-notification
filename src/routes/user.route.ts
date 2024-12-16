import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/", UserController.get);
router.post("/", UserController.create);
router.patch("/:id", UserController.update);
router.delete("/:id", UserController.remove);

export default router;
