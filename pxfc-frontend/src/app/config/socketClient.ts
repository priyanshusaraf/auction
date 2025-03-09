// src/config/socketClient.ts
import { io } from "socket.io-client";

// Create a more robust socket client with proper debugging
const getSocketURL = () => {
  // Make sure we're using the correct base URL
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  console.log("Socket connecting to:", url);
  return url;
};

// Export this for debugging purposes
export const SOCKET_URL = getSocketURL();

// Create socket instance with more debugging
export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Try websocket first, fallback to polling
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000, // Increase timeout to 20 seconds
  autoConnect: true,
  path: "/socket.io",
  query: {
    client: "web",
    timestamp: Date.now().toString(),
  },
});

// Detailed socket event tracking
const socketDebug = (event, ...args) => {
  console.log(
    `%c[Socket] ${event}`,
    "background: #333; color: #bada55",
    ...args
  );
};

// Configure socket event handlers with detailed logging
socket.on("connect", () => {
  socketDebug("Connected", socket.id);

  // Emit a ping to test bidirectional communication
  socket.emit("ping", { timestamp: Date.now() });
});

socket.on("pong", (data) => {
  socketDebug("Received pong", data);
});

socket.on("connect_error", (error) => {
  socketDebug("Connection Error", error);
});

socket.on("disconnect", (reason) => {
  socketDebug("Disconnected", reason);
});

socket.on("reconnect_attempt", (attemptNumber) => {
  socketDebug("Reconnection attempt", attemptNumber);
});

socket.on("reconnect", (attemptNumber) => {
  socketDebug("Reconnected", attemptNumber);
});

socket.on("error", (error) => {
  socketDebug("Socket Error", error);
});

// We'll add a specific listener for auction updates with detailed logging
socket.on("auctionUpdate", (data) => {
  socketDebug("Auction Update Received", {
    type: data.type,
    timestamp: data.timestamp,
    teamId: data.teamData?.id,
    playerId: data.playerData?.id,
    payload: data,
  });

  // Check for data issues
  if (!data.teamData && !data.playerData) {
    console.warn("Received auctionUpdate with no team or player data");
  }
  if (data.teamData && typeof data.teamData.budget !== "number") {
    console.warn("Team budget is not a number:", data.teamData.budget);
  }
  if (
    data.playerData &&
    typeof data.playerData.bidAmount !== "number" &&
    data.playerData.bidAmount !== undefined
  ) {
    console.warn(
      "Player bidAmount is not a number:",
      data.playerData.bidAmount
    );
  }
});

/**
 * Connect socket with health check
 */
export const connectSocket = (): void => {
  socketDebug("Attempting connection");

  if (!socket.connected) {
    socket.connect();

    // Schedule health check after connecting
    setTimeout(() => {
      if (socket.connected) {
        socketDebug("Socket health check: Connected");
        socket.emit("ping", { timestamp: Date.now() });
      } else {
        socketDebug("Socket health check: Not connected");
        // Try to reconnect
        socket.connect();
      }
    }, 2000);
  } else {
    socketDebug("Already connected");
    // Send health check ping
    socket.emit("ping", { timestamp: Date.now() });
  }
};

/**
 * Force reconnect the socket
 */
export const forceReconnect = (): void => {
  socketDebug("Force reconnecting");

  // Properly close and reconnect
  if (socket.connected) socket.disconnect();

  // Small delay to ensure clean disconnect
  setTimeout(() => {
    socket.connect();
    socketDebug("Reconnection initiated");
  }, 500);
};

// Add a health check to test if both socket connection and event flow are working
export const testSocketConnection = () => {
  if (!socket.connected) {
    socketDebug("Socket not connected. Attempting to connect...");
    socket.connect();
    return false;
  }

  socketDebug("Testing connection with ping...");
  socket.emit("ping", { timestamp: Date.now() });
  return true;
};

export default socket;
