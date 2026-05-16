import app from "./app.js";
import { config, validateEnv } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";

validateEnv();

let server;
let shuttingDown = false;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      console.log(`HunarHub API listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start HunarHub API:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Closing HunarHub API...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log("HunarHub API closed.");
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("uncaughtException");
});

start();
