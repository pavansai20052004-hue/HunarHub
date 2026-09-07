import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { config } from "./env.js";
import User from "../models/schemas/User.js";
import Entrepreneur from "../models/schemas/Entrepreneur.js";
import ServiceRequest from "../models/schemas/ServiceRequest.js";

export const connectDB = async () => {
  await mongoose.connect(config.mongoUrl, {
    maxPoolSize: config.dbPoolMax,
    serverSelectionTimeoutMS: 10000,
  });
  await Promise.all([User.init(), Entrepreneur.init(), ServiceRequest.init()]);

  if (config.adminEmail && config.adminPassword) {
    const password = await bcrypt.hash(config.adminPassword, config.bcryptRounds);
    await User.findOneAndUpdate(
      { email: config.adminEmail },
      { $set: { name: config.adminName, password, role: "admin" } },
      { upsert: true, runValidators: true }
    );
  }

  console.log("MongoDB connected");
};

export const disconnectDB = () => mongoose.disconnect();

export const checkDbHealth = async () => {
  if (mongoose.connection.readyState !== 1) return false;
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
};
