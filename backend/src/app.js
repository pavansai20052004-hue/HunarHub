import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config, isProduction } from "./config/env.js";
import { checkDbHealth } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import entrepreneurRoutes from "./routes/entrepreneurRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";

const app = express();

const allowedOrigins = new Set(
  [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://hunarhub-k1k0.onrender.com",
    ...config.frontendUrls,
  ].filter(Boolean)
);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(requestContext);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
});

app.get("/api", (_req, res) =>
  res.json({
    name: "HunarHub API",
    status: "running",
    environment: config.env,
  })
);

app.get("/health", async (_req, res) => {
  const healthy = await checkDbHealth();

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    database: healthy ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
    environment: isProduction ? "production" : config.env,
  });
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/entrepreneurs", entrepreneurRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", serviceRequestRoutes);

if (isProduction) {
  const frontendDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../frontend/dist"
  );
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && req.accepts("html")) {
      return res.sendFile(path.join(frontendDist, "index.html"));
    }
    return next();
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
