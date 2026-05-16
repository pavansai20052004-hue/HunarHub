import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export const protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return next(new HttpError(401, "Not authorized, token missing"));
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Session expired" : "Not authorized, token invalid";
    return next(new HttpError(401, message));
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, "Forbidden: insufficient role"));
  }
  return next();
};
