import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { jwtMiddleware } from "./middleware/jwtMiddleware";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's origin
  })
);

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  })
);

app.use(
  "/api/todo",
  jwtMiddleware,
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/api/todo": "" },
    on: {
      proxyReq: (proxyReq, req: express.Request, res) => {
        if (req.user) {
          console.log(req.user.documentId);
          proxyReq.setHeader("user-id", req.user.documentId);
        }
      },
      error: (err, req, res) => {
        console.log(err);
      },
    },
  })
);

export default app;
