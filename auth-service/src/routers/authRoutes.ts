// routes/authRoutes.ts
import { Router } from "express";
import { signup, signin, refreshToken } from "../controller/authController";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/refreshToken", refreshToken);

export default authRouter;
