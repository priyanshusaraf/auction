"use client";

import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import { Input } from "@/components/ui/input";

export default function PlayerSidebar() {
  const { user, isSignedIn } = useUser();
  const { players, searchQuery, setSearchQuery, availablePlayers } =
    useAuctionStore();

  // Call availablePlayers() since it's a function
  const filteredPlayers = availablePlayers();

  // Check if the user is an admin
  const adminEmails = ["admin@example.com"]; // Replace with actual admin emails
  const isAdmin =
    isSignedIn &&
    adminEmails.includes(user?.primaryEmailAddress?.emailAddress || "");

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
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            draggable={isAdmin} // Only admins can drag
            onDragStart={(e) =>
              isAdmin && e.dataTransfer.setData("playerId", player.id)
            }
            className={`p-3 rounded-md cursor-pointer ${
              isAdmin
                ? "bg-blue-100 hover:bg-blue-200"
                : "bg-gray-200 cursor-not-allowed"
            }`}
          >
            {player.name} - {player.category}
          </div>
        ))}
      </div>
    </div>
  );
}
