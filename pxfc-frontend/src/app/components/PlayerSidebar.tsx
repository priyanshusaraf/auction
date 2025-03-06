// components/PlayerSidebar.tsx
"use client";
import { useAuctionStore } from "@/component/AuctionLogic";
import { Input } from "@/components/ui/input";

export default function PlayerSidebar() {
  const { players, searchQuery, setSearchQuery, availablePlayers } =
    useAuctionStore();

  return (
    <div className="w-1/4 p-4 bg-white shadow-lg">
      <h2 className="text-xl font-bold mb-4">Players</h2>

      {/* Search Input */}
      <Input
        placeholder="Search Player..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Player List */}
      <div className="space-y-2">
        {availablePlayers.map((player) => (
          <div
            key={player.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("playerId", player.id)}
            className="p-3 bg-blue-100 hover:bg-blue-200 rounded-md cursor-pointer"
          >
            {player.name} - {player.category}
          </div>
        ))}
      </div>
    </div>
  );
}
