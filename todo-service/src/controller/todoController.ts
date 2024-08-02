import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/couchbase";
import { QueryResult } from "couchbase";
import APIError from "../errors/APIError";

let collection: any;
let bucket: any;
(async () => {
  const { bucket: b, collection_default } = await db();
  bucket = b;
  collection = collection_default;
})();

// Create a new todo
export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;
    const todoId = uuidv4();

    const userId = req.headers["user-id"];
    console.log("Received Document ID:", userId);

    if (!userId) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const newTodo = {
      id: todoId,
      text,
      author: userId,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTodos = userDoc.value.todos
      ? [...userDoc.value.todos, newTodo]
      : [newTodo];
    const updatedUser = {
      ...userDoc.value,
      todos: updatedTodos,
    };

    await collection.upsert(userId, updatedUser);

    res.status(201).json({ message: "Todo created successfully", newTodo });
  } catch (error) {
    next(error);
  }
};

// Get all todos by user ID
export const getAllTodosByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers["user-id"];

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];

    res.status(200).json({ todos });
  } catch (error) {
    next(error);
  }
};

// Update a todo
export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text, isCompleted } = req.body;

    const userId = req.headers["user-id"];
    if (!userId) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];
    const todoIndex = todos.findIndex((todo: any) => todo.id === id);
    if (todoIndex === -1) {
      throw new APIError(404, "TODO_NOT_FOUND", `Todo not found with id ${id}`);
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...(text !== undefined ? { text } : {}),
      ...(isCompleted !== undefined ? { isCompleted } : {}),
      updatedAt: new Date(),
    };

    todos[todoIndex] = updatedTodo;
    const updatedUser = {
      ...userDoc.value,
      todos,
    };

    await collection.upsert(userId, updatedUser);

    res.status(200).json({ message: "Todo updated successfully", updatedTodo });
  } catch (error) {
    next(error);
  }
};

// Get completed todos by user ID
export const getCompletedTodosByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers["user-id"];

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];
    const completedTodos = todos.filter((todo: any) => todo.isCompleted);

    res.status(200).json({ todos: completedTodos });
  } catch (error) {
    next(error);
  }
};

export const getNotCompletedTodosByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.headers["user-id"];

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];
    const completedTodos = todos.filter(
      (todo: any) => todo.isCompleted === false
    );

    res.status(200).json({ todos: completedTodos });
  } catch (error) {
    next(error);
  }
};

// Get a todo by ID
export const getTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const userId = req.headers["user-id"];
    if (!userId) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];
    const todo = todos.find((todo: any) => todo.id === id);
    if (!todo) {
      throw new APIError(404, "TODO_NOT_FOUND", `Todo not found with id ${id}`);
    }

    res.status(200).json({ todo });
  } catch (error) {
    next(error);
  }
};

// Delete a todo by ID
export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const userId = req.headers["user-id"];
    if (!userId) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const userDoc = await collection.get(userId);
    if (!userDoc) {
      throw new APIError(
        404,
        "USER_NOT_FOUND",
        `User not found with id ${userId}`
      );
    }

    const todos = userDoc.value.todos || [];
    const todoIndex = todos.findIndex((todo: any) => todo.id === id);
    if (todoIndex === -1) {
      throw new APIError(404, "TODO_NOT_FOUND", `Todo not found with id ${id}`);
    }

    todos.splice(todoIndex, 1);
    const updatedUser = {
      ...userDoc.value,
      todos,
      updatedAt: new Date(),
    };

    await collection.upsert(userId, updatedUser);

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    next(error);
  }
};
