import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import entrepreneurRoutes from "./routes/entrepreneurRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Missing MONGO_URI environment variable");
}

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const app = express();
const allowedOrigins = new Set([
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()) : [])
].filter(Boolean));

app.use(cors({
origin: (origin, callback) => {
    // Allow server-to-server, Postman, and health checks without Origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => res.send("HunarHub API running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/entrepreneurs", entrepreneurRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", serviceRequestRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});