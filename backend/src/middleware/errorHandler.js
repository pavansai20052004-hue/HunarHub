import { isProduction } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const validationDetails = (error) =>
  Object.values(error.errors || {}).map((item) => ({
    field: item.path,
    message: item.message,
  }));

const normalizeError = (error) => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
      expose: error.expose,
    };
  }

  if (error?.name === "ValidationError") {
    return {
      statusCode: 400,
      message: "Validation failed",
      details: validationDetails(error),
      expose: true,
    };
  }

  if (error?.code === "23505") {
    return {
      statusCode: 409,
      message: "A record with those details already exists",
      expose: true,
    };
  }

  if (error?.code === "22P02") {
    return {
      statusCode: 400,
      message: "Invalid resource identifier",
      expose: true,
    };
  }

  return {
    statusCode: error?.statusCode || error?.status || 500,
    message: error?.message || "Internal server error",
    expose: false,
  };
};

export const notFound = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode >= 400 ? normalized.statusCode : 500;
  const message =
    normalized.expose || !isProduction ? normalized.message : "Something went wrong";

  if (statusCode >= 500) {
    console.error(`[${req.id || "no-request-id"}]`, error);
  }

  res.status(statusCode).json({
    message,
    requestId: req.id,
    ...(normalized.details ? { details: normalized.details } : {}),
    ...(!isProduction && error?.stack ? { stack: error.stack } : {}),
  });
};
