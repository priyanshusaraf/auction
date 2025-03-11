// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "express";
import http from "http";
import dotenv from "dotenv";
import playerRoutes from "./routes/playerRoutes";
import { initializeSocket } from "./config/socket";
import teamRoutes from "./routes/teamRoutes";
import auctionRoutes from "./routes/auctionRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
try {
  initializeSocket(server);
  console.log("Socket.IO initialized successfully");
} catch (error) {
  console.error("Failed to initialize Socket.IO:", error);
}

// Add a health check endpoint (before other routes)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Database connection test endpoint
app.get("/db-test", async (req, res) => {
  try {
    // Import your database connection
    const knex = require("./config/database"); // Adjust this path as needed

    // Test the connection
    await knex.raw("SELECT 1");

    res.json({
      status: "Database connection successful",
      dbHost: process.env.DB_HOST || "not set",
      dbName: process.env.DB_NAME || "not set",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      status: "Database connection failed",
      error: error.message,
      dbHost: process.env.DB_HOST || "not set",
      dbName: process.env.DB_NAME || "not set",
      dbUser: process.env.DB_USER ? "is set" : "not set",
      dbPassword: process.env.DB_PASSWORD ? "is set" : "not set",
    });
  }
});

app.get("/", (req, res) => {
  console.log("Environment variables:");
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- DB_HOST: ${process.env.DB_HOST ? "is set" : "NOT SET"}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME ? "is set" : "NOT SET"}`);

  res.json({
    message: "Auction API is running!",
    env: process.env.NODE_ENV,
    dbConnected: Boolean(process.env.DB_HOST && process.env.DB_NAME),
  });
});

app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/auction", auctionRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Environment variables:");
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- PORT: ${PORT}`);
  console.log(`- DB_HOST: ${process.env.DB_HOST ? "is set" : "NOT SET"}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME ? "is set" : "NOT SET"}`);
  console.log(`- DB_USER: ${process.env.DB_USER ? "is set" : "NOT SET"}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
