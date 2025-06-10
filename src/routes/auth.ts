import { Request, Response, Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/authController";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  registerController(req, res);
});

router.post("/login", (req: Request, res: Response) => {
  loginController(req, res);
});

export default router;
