"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const express_2 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const socket_1 = require("./config/socket");
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const auctionRoutes_1 = __importDefault(require("./routes/auctionRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8081;
// Middleware
app.use((0, express_2.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
try {
    (0, socket_1.initializeSocket)(server);
    console.log("Socket.IO initialized successfully");
}
catch (error) {
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
    }
    catch (error) {
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
app.use("/api/players", playerRoutes_1.default);
app.use("/api/teams", teamRoutes_1.default);
app.use("/api/auction", auctionRoutes_1.default);
app.use((err, req, res, next) => {
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
