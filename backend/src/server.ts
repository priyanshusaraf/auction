const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const http = require("http");
const dotenv = require("dotenv").config();
import playerRoutes from "./routes/playerRoutes";
import teamRoutes from "./routes/teamRoutes";
import auctionRoutes from "./routes/auctionRoutes";
import { initializeSocket } from "./config/socket";
import authRoutes from "./routes/authRoutes";

const app = express();
const server = http.createServer(app);

initializeSocket(server);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use("/auth", authRoutes); // ✅ Register auth routes
app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);
app.use("/auction", auctionRoutes);

server.listen(process.env.PORT || 5000, () => {
  console.log(
    `✅ Server running on http://localhost:${process.env.PORT || 5000}`
  );
});
