import { io } from "socket.io-client";

// Get the API URL from environment variable or use a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create a socket instance
export const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Log socket connection status
socket.on("connect", () => {
  console.log("✅ Socket connected");
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});
