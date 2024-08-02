// types/express/index.d.ts
import { Request } from "express";

declare module "express" {
  export interface Request {
    validateUser: SafeUser;
  }
}

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  lastname: string;
  todos: Todo[];
}

export type SafeUser = Omit<User, "password">;
