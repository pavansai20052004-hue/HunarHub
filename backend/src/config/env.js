import dotenv from "dotenv";

dotenv.config({ quiet: true });

const toList = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toPositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrls: toList(process.env.FRONTEND_URL),
  bcryptRounds: toPositiveNumber(process.env.BCRYPT_ROUNDS, 10),
  rateLimitWindowMs: toPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toPositiveNumber(process.env.RATE_LIMIT_MAX, 250),
};

export const isProduction = config.env === "production";

export const validateEnv = () => {
  const missing = [];

  if (!config.mongoUri) missing.push("MONGO_URI");
  if (!config.jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (isProduction && config.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
};
