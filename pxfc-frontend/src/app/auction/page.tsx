"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import PlayerSidebar from "@/component/PlayerSidebar";
import TeamCard from "@/component/TeamCard";

export default function AuctionPage() {
  const { isSignedIn } = useUser();
  const { teams } = useAuctionStore(); // Ensure teams are fetched

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Logout Button */}
      <div className="absolute top-4 right-4">
        {isSignedIn && <UserButton />}
      </div>
      <PlayerSidebar isAuthenticated={isSignedIn} />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>

        {/* Ensure teams are mapped correctly */}
        <div className="grid grid-cols-3 gap-4">
          {Array.isArray(teams) && teams.length > 0 ? (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isAuthenticated={isSignedIn}
              />
            ))
          ) : (
            <p className="text-gray-500 italic">No teams available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
