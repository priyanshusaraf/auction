"use client";

import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import PlayerCard from "./PlayerCard";

export default function TeamCard({ team }) {
  const { isSignedIn } = useUser();
  const { addPlayerToTeam, removePlayerFromTeam } = useAuctionStore();

  if (!team) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg">Loading team...</div>
    ); // ✅ Handles undefined team
  }

  const handleDrop = (e) => {
    if (!isSignedIn) return;

    e.preventDefault();
    const playerId = e.dataTransfer.getData("playerId");
    addPlayerToTeam(team.id, playerId);
  };

  return (
    <div
      className="p-4 bg-white shadow-md rounded-lg min-h-[200px]"
      onDragOver={(e) => isSignedIn && e.preventDefault()}
      onDrop={isSignedIn ? handleDrop : undefined}
    >
      <h3 className="text-lg font-bold">{team.name}</h3>
      <p className="text-sm text-gray-500">Budget: {team.budget}</p>

      {/* Player List */}
      <div className="mt-4 space-y-2">
        {team.players.length > 0 ? (
          team.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onRemove={() =>
                isSignedIn && removePlayerFromTeam(team.id, player.id)
              }
            />
          ))
        ) : (
          <p className="text-gray-400">No players in this team yet.</p> // ✅ Prevents empty team errors
        )}
      </div>
    </div>
  );
}
