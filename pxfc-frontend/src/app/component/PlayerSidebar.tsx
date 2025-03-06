"use client";

import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import { Input } from "@/components/ui/input";

export default function PlayerSidebar() {
  const { isSignedIn } = useUser();
  const { searchQuery, setSearchQuery, availablePlayers } = useAuctionStore();

  // Call availablePlayers() since it's a function
  const filteredPlayers = availablePlayers();

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

      {/* Player List - Visible to All Users */}
      <div className="space-y-2">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              draggable={isSignedIn} // Only signed-in users can drag
              onDragStart={(e) =>
                isSignedIn && e.dataTransfer.setData("playerId", player.id)
              }
              className={`p-3 rounded-md transition ${
                isSignedIn
                  ? "bg-blue-100 hover:bg-blue-200 cursor-pointer"
                  : "bg-gray-200 cursor-not-allowed"
              }`}
            >
              {player.name} - {player.category}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No players available.</p>
        )}
      </div>
    </div>
  );
}
