import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../models/User.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const allowedRoles = ["customer", "entrepreneur"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
});

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role, location } = req.body;
    const finalRole = role && allowedRoles.includes(role) ? role : "customer";
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!trimmedName || !normalizedEmail || !password) {
      throw new HttpError(400, "Name, email, and password are required");
    }

    if (!emailPattern.test(normalizedEmail)) {
      throw new HttpError(400, "Please provide a valid email address");
    }

    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const exists = await User.existsByEmail(normalizedEmail);
    if (exists) throw new HttpError(409, "Email already registered");

    const hashed = await bcrypt.hash(password, config.bcryptRounds);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashed,
      role: finalRole,
      location: location?.trim() || "",
    });

    return res.status(201).json({
      message: "Registered successfully",
      token: signToken(user),
      user: publicUser(user),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new HttpError(400, "Email and password are required");
    }

    const user = await User.findByEmail(normalizedEmail);
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    return res.json({
      message: "Login successful",
      token: signToken(user),
      user: publicUser(user),
    });
  })
);

export default router;
