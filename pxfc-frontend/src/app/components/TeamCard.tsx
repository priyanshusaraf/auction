// components/TeamCard.tsx
"use client";
import { useAuctionStore } from "@/component/AuctionLogic";
import PlayerCard from "./PlayerCard";

export default function TeamCard({ team }) {
  const { addPlayerToTeam, removePlayerFromTeam } = useAuctionStore();

  const handleDrop = (e) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData("playerId");
    addPlayerToTeam(team.id, playerId);
  };

  return (
    <div
      className="p-4 bg-white shadow-md rounded-lg min-h-[200px]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h3 className="text-lg font-bold">{team.name}</h3>
      <p className="text-sm text-gray-500">Budget: {team.budget}</p>

      {/* Player List */}
      <div className="mt-4 space-y-2">
        {team.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onRemove={() => removePlayerFromTeam(team.id, player.id)}
          />
        ))}
      </div>
    </div>
  );
}
