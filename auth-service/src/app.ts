import express from "express";
import { json, urlencoded } from "body-parser";
import { db } from "./config/couchbase";
import router from "./routers";
import { globalErrorMiddleware } from "./middleware/errorMiddleware";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
  })
);

// initialize global middlewares
app.use(urlencoded({ extended: false }));
app.use(json());

db();

app.use("", router);

app.use(globalErrorMiddleware);

export default app;
