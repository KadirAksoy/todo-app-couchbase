import { Request, Response, NextFunction } from "express";

import APIError from "../errors/APIError";
import TokenService from "../jwt/tokenService";

export const authMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const providedAuth = req.headers.authorization;

    if (!providedAuth)
      return next(
        new APIError(403, "MISSING_ACCESS_TOKEN", "Access token not provided")
      );

    const accessToken = providedAuth.split(" ")[1]; // ['Bearer', 'accessToken'][1]

    const user = TokenService.verifyAccessToken(accessToken);

    req.validateUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
