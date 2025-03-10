// src/config/socketClient.ts

import { io, Socket } from "socket.io-client";
import { toast } from "react-hot-toast";

// Simple fixed version that avoids namespace issues
let socketInstance: Socket | null = null;

const initSocket = () => {
  // CRUCIAL FIX: Make sure the URL doesn't have any path components which can be interpreted as a namespace
  let baseUrl;

  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_URL) {
      // Extract only the origin part to avoid namespace issues
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_URL);
        baseUrl = url.origin; // This gets just http://hostname:port without any path
      } catch (e) {
        baseUrl = process.env.NEXT_PUBLIC_API_URL;
      }
    } else {
      baseUrl = window.location.origin;
    }
  } else {
    baseUrl = "http://localhost:5000"; // Default during SSR
  }

  console.log("Socket connecting to:", baseUrl);

  // Create the socket with the correct configuration
  // path: "/socket.io" is standard - only change if your server uses a different path
  const socket = io(baseUrl, {
    transports: ["websocket", "polling"],
    path: "/socket.io", // Standard Socket.IO path
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  // Set up event handlers
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    toast.success("Live updates connected");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    toast.error("Live updates disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

// Get or create the socket
export const getSocket = (): Socket | null => {
  if (!socketInstance) {
    try {
      socketInstance = initSocket();
    } catch (err) {
      console.error("Failed to initialize socket:", err);
      return null;
    }
  }
  return socketInstance;
};

// Explicitly initialize socket as early as possible
if (typeof window !== "undefined") {
  getSocket();
}

// Export the socket instance
export const socket = typeof window !== "undefined" ? getSocket() : null;

// Connect socket
export const connectSocket = (): void => {
  const s = getSocket();
  if (s && !s.connected) {
    console.log("Connecting socket...");
    s.connect();
  }
};

// Force reconnect
export const forceReconnect = (): void => {
  const s = getSocket();
  if (!s) return;

  if (s.connected) s.disconnect();

  setTimeout(() => {
    s.connect();
  }, 300);
};

// Check if socket is connected
export const isSocketConnected = (): boolean => {
  return socketInstance?.connected || false;
};

export default socket;
