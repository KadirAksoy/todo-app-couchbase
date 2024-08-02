import { Request } from "express";
import BaseError from "../errors/BaseError";
import APIError from "../errors/APIError";
import { DocumentNotFoundError, QueryResult } from "couchbase";

export const validateRequiredFields = <T>(req: Request, fields: string[]) => {
  const errors: string[] = [];
  const requiredFieldsObj: Record<string, any> = {};

  fields.forEach((field) => {
    if (!req.body[field]) errors.push(field);
  });

  if (errors.length > 0)
    throw new APIError(
      400,
      "MISSING_REQUIRED_FIELDS",
      `${errors.join(", ")} fields should be proivded`
    );

  fields.forEach((field) => (requiredFieldsObj[field] = req.body[field]));

  return requiredFieldsObj as T;
};

export const isTrustedError = (err: Error) => {
  if (err instanceof BaseError) return err.isOperational;
  return false;
};

export const errorFilter = (err: Error) => {
  // If the error is a trusted error and an instance of BaseError, return it directly
  if (isTrustedError(err) && err instanceof BaseError) return err;
  else if (err instanceof DocumentNotFoundError) {
    // @ts-ignore
    const id = err.cause.id;
    return new APIError(
      404,
      "DOCUMENT_NOT_FOUND",
      `No such document with ${id}`
    );
  }

  return new APIError(
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong internaly"
  );
};

export const validateNewUser = (user: {
  name: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  const requiredFields = ["name", "lastName", "email", "password"];
  const missingFields = requiredFields.filter(
    (field) => !user[field as keyof typeof user]
  );

  if (missingFields.length > 0) {
    throw new APIError(
      400,
      "MISSING_REQUIRED_FIELDS",
      `These arguments are missing: ${missingFields.join(", ")}`
    );
  }
};
