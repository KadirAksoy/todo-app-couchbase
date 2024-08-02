// routes/authRoutes.ts
import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodosByUserId,
  getCompletedTodosByUserId,
  getNotCompletedTodosByUserId,
  getTodo,
  updateTodo,
} from "../controller/todoController";

const todoRouter = Router();

todoRouter.post("/create", createTodo);
todoRouter.get("/getAll", getAllTodosByUserId);
todoRouter.put("/update/:id", updateTodo);
todoRouter.get("/getAllCompleted", getCompletedTodosByUserId);
todoRouter.get("/getTodo/:id", getTodo);
todoRouter.delete("/delete/:id", deleteTodo);
todoRouter.get("/getNotCompleted", getNotCompletedTodosByUserId);

export default todoRouter;
