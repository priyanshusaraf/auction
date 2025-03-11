// app.js
import express from "express";
import http from "http";

const app = express();
const PORT = process.env.PORT || 8081;

// Basic health check route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Basic API is running!",
    env: process.env.NODE_ENV,
    port: PORT,
    envVars: {
      DB_HOST: process.env.DB_HOST ? "is set" : "NOT SET",
      DB_NAME: process.env.DB_NAME ? "is set" : "NOT SET",
      DB_USER: process.env.DB_USER ? "is set" : "NOT SET",
    },
  });
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
