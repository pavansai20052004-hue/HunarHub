import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import entrepreneurRoutes from "./routes/entrepreneurRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:3000"],
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