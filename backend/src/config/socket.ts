// src/config/socket.ts
import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initializeSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("🔌 A user connected:", socket.id);

    // Respond to ping with pong
    socket.on("ping", (data) => {
      console.log("Received ping from client:", socket.id, data);
      socket.emit("pong", {
        received: true,
        timestamp: Date.now(),
        serverTime: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ A user disconnected:", socket.id, reason);
    });
  });

  // Set up an interval to log connected clients
  setInterval(() => {
    const clientCount = io.engine.clientsCount || 0;
    console.log(`Socket health check: ${clientCount} clients connected`);
  }, 30000); // Every 30 seconds

  return io;
};

/**
 * Emit auction updates to clients
 */
export const emitAuctionUpdate = (
  type: string,
  data: {
    teamData?: any;
    playerData?: any;
    [key: string]: any;
  }
): void => {
  if (!io) {
    console.error("Socket.io not initialized when trying to emit:", type, data);
    return;
  }

  try {
    console.log(`Emitting ${type} event at ${new Date().toISOString()}`);

    // Deep copy to avoid modifying the original data
    const safeData = JSON.parse(JSON.stringify(data));

    // Ensure numeric values are properly converted
    if (safeData.teamData && safeData.teamData.budget !== undefined) {
      safeData.teamData.budget = Number(safeData.teamData.budget);
      console.log(
        `Team ${safeData.teamData.id} budget: ${safeData.teamData.budget}`
      );

      // Also ensure player data in team is numeric
      if (Array.isArray(safeData.teamData.players)) {
        safeData.teamData.players.forEach((player) => {
          if (player.price !== undefined) {
            player.price = Number(player.price);
          }
          if (player.bidAmount !== undefined) {
            player.bidAmount = Number(player.bidAmount);
          }
        });
      }
    }

    if (safeData.playerData) {
      if (safeData.playerData.price !== undefined) {
        safeData.playerData.price = Number(safeData.playerData.price);
      }
      if (safeData.playerData.bidAmount !== undefined) {
        safeData.playerData.bidAmount = Number(safeData.playerData.bidAmount);
        console.log(
          `Player ${safeData.playerData.id} bid amount: ${safeData.playerData.bidAmount}`
        );
      }
    }

    // Create the update message
    const updateMessage = {
      type: type,
      teamData: safeData.teamData,
      playerData: safeData.playerData,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected clients
    const clientsCount = io.engine.clientsCount || 0;
    console.log(`Broadcasting to ${clientsCount} clients`);

    // Emit to all clients
    io.emit("auctionUpdate", updateMessage);
    console.log(`Event ${type} emitted successfully`);

    // For verification, log a sample of the data sent
    console.log("Sample of emitted data:", {
      type: updateMessage.type,
      timestamp: updateMessage.timestamp,
      teamBudget: updateMessage.teamData?.budget,
      teamPlayers: updateMessage.teamData?.players?.length || 0,
      playerName: updateMessage.playerData?.name,
      playerBidAmount: updateMessage.playerData?.bidAmount,
    });

    // Send verification ping
    setTimeout(() => {
      io.emit("update_verification", {
        type,
        timestamp: new Date().toISOString(),
        messageId: `${type}-${Date.now()}`,
      });
    }, 500);
  } catch (error) {
    console.error("Error during socket emission:", error);

    // Attempt to emit without processing as fallback
    try {
      io.emit("auctionUpdate", {
        type,
        teamData: data.teamData,
        playerData: data.playerData,
        timestamp: new Date().toISOString(),
        error: "Data processing error",
      });
      console.log("Emitted fallback message due to processing error");
    } catch (emitError) {
      console.error("Critical socket emission failure:", emitError);
    }
  }
};

/**
 * Get the socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
