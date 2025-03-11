"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.emitAuctionUpdate = exports.initializeSocket = void 0;
// src/config/socket.ts
const socket_io_1 = require("socket.io");
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
exports.initializeSocket = initializeSocket;
/**
 * Emit auction updates to clients
 */
const emitAuctionUpdate = (type, data) => {
    var _a, _b, _c, _d, _e;
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
            console.log(`Team ${safeData.teamData.id} budget: ${safeData.teamData.budget}`);
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
                console.log(`Player ${safeData.playerData.id} bid amount: ${safeData.playerData.bidAmount}`);
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
            teamBudget: (_a = updateMessage.teamData) === null || _a === void 0 ? void 0 : _a.budget,
            teamPlayers: ((_c = (_b = updateMessage.teamData) === null || _b === void 0 ? void 0 : _b.players) === null || _c === void 0 ? void 0 : _c.length) || 0,
            playerName: (_d = updateMessage.playerData) === null || _d === void 0 ? void 0 : _d.name,
            playerBidAmount: (_e = updateMessage.playerData) === null || _e === void 0 ? void 0 : _e.bidAmount,
        });
        // Send verification ping
        setTimeout(() => {
            io.emit("update_verification", {
                type,
                timestamp: new Date().toISOString(),
                messageId: `${type}-${Date.now()}`,
            });
        }, 500);
    }
    catch (error) {
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
        }
        catch (emitError) {
            console.error("Critical socket emission failure:", emitError);
        }
    }
};
exports.emitAuctionUpdate = emitAuctionUpdate;
/**
 * Get the socket.io instance
 */
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};
exports.getIO = getIO;
