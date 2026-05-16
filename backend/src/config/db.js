import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDB = async () => {
  const conn = await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};
