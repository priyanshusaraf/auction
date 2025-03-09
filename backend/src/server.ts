// src/server.ts
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { initializeSocket } from "./config/socket";
import playerRoutes from "./routes/playerRoutes";
import teamRoutes from "./routes/teamRoutes";
import auctionRoutes from "./routes/auctionRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
initializeSocket(server);

// Routes
app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/auction", auctionRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Auction API is running!" });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
