import e, { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { db } from "../config/couchbase";
import { QueryResult } from "couchbase";
import APIError from "../errors/APIError";
import TokenService from "../jwt/tokenService";
import { validateNewUser, validateRequiredFields } from "../helpers/utils";

let collection: any;
let bucket: any;
(async () => {
  const { bucket: b, collection_default } = await db();
  bucket = b;
  collection = collection_default;
})();

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, lastName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const newUser = {
      name,
      lastName,
      email,
      password: hashedPassword,
    };

    validateNewUser(newUser);
    await checkUserExists(email);

    const createdUser = await collection.upsert(id, newUser);

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User signin
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const query = `SELECT META(b).id AS documentId, b.*
    FROM \`myBucket\`._default._default AS b
    WHERE b.email = $1`;

    const params = email;

    // Query Bucket instead of Collection
    const result: QueryResult = await bucket
      .scope("_default")
      .query(query, { parameters: [params] });

    if (result.rows.length === 0) {
      throw new APIError(
        400,
        "MISSING_REQUIRED_FIELDS",
        "Some argument is missing"
      );
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(
        new APIError(404, "PASSWORD_INCORRECT", "Password is not true")
      );
    }

    delete user.password;
    delete user.todos;

    const token = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken({
      id: user.documentId,
    });

    res.status(200).json({
      message: "Signin successful",
      data: {
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = validateRequiredFields<{ refreshToken: string }>(
      req,
      ["refreshToken"]
    );

    const verifiedRefreshToken = TokenService.verifyRefreshToken(refreshToken);

    const query = `SELECT META(b).id AS documentId, b.*
    FROM \`myBucket\`._default._default AS b
    WHERE META(b).id = $1`;
    const params = verifiedRefreshToken.id;
    const result: QueryResult = await bucket
      .scope("_default")
      .query(query, { parameters: [params] });

    const user = result.rows[0];

    delete user.password;
    delete user.todos;

    const accessToken = TokenService.generateAccessToken(user);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const checkUserExists = async (email: string): Promise<void> => {
  const query = `SELECT * FROM \`myBucket\`._default._default WHERE email = $1`;
  const params = email;
  const result: QueryResult = await bucket
    .scope("_default")
    .query(query, { parameters: [params] });

  if (result.rows.length > 0) {
    throw new APIError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email already exists"
    );
  }
};
