import { Router } from "express";

import todoRouter from "./todoRoutes";

const router = Router();

router.use("", todoRouter);

export default router;
