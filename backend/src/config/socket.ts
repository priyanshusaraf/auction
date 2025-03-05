import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 A user connected");

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected");
    });
  });
};

export const emitAuctionUpdate = (data: any) => {
  if (io) {
    io.emit("auctionUpdate", data);
  }
};
