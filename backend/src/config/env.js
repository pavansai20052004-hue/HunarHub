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
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrls: toList(process.env.FRONTEND_URL),
  bcryptRounds: toPositiveNumber(process.env.BCRYPT_ROUNDS, 10),
  rateLimitWindowMs: toPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toPositiveNumber(process.env.RATE_LIMIT_MAX, 250),
  dbPoolMax: toPositiveNumber(process.env.DB_POOL_MAX, 10),
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD,
  adminName: process.env.ADMIN_NAME?.trim() || "HunarHub Admin",
};

export const isProduction = config.env === "production";

export const validateEnv = () => {
  const missing = [];

  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!/^postgres(ql)?:\/\//.test(config.databaseUrl)) {
    throw new Error("DATABASE_URL must be a valid Postgres connection string");
  }

  if (isProduction && config.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }

  if (isProduction && config.frontendUrls.length === 0) {
    throw new Error("FRONTEND_URL is required in production");
  }

  if (config.adminPassword && config.adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters when provided");
  }
};
