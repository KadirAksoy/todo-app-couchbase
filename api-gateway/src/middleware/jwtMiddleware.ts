import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = "supersecretTokenPassword";
const REFRESH_TOKEN_SECRET = TOKEN_SECRET + "refresh";

interface DecodedToken {
  documentId: string;
  // Diğer token bilgileri burada eklenebilir
}

export const jwtMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, TOKEN_SECRET) as DecodedToken;

      req.user = decoded;
      console.log(req.user);
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
