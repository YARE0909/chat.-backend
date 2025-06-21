import { Request, Response, Router } from "express";
import { getUserListController } from "../controllers/getUserListController";

const router = Router();

router.get("/usersList", (req: Request, res: Response) => {
  getUserListController(req, res);
});

export default router;
