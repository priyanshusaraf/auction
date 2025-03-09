"use client";

import { useEffect } from "react";
import { useAuctionStore } from "@/component/AuctionLogic";
import TeamCard from "@/component/TeamCard";
import PlayerSidebar from "@/component/PlayerSidebar";
import { socket } from "@/config/socketClient";
import { Toaster } from "react-hot-toast";

export default function AuctionPage() {
  const { teams, players, loading, error, fetchInitialData, setSearchQuery } =
    useAuctionStore((state) => state);

  useEffect(() => {
    // Load initial data from server
    fetchInitialData();

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Clean up on unmount
    return () => {
      // Don't disconnect socket here as we want to keep it active across page navigation
    };
  }, [fetchInitialData]);

  // Update the store with the available players
  useEffect(() => {
    if (players && players.length > 0) {
      // Filter out sold players for the available players list
      const availablePlayers = players.filter((player) => !player.sold);

      // Update the availablePlayers in the store
      useAuctionStore.setState({ availablePlayers });
    }
  }, [players]);

  if (loading) {
    return <div className="p-10 text-center">Loading auction data...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" />

      {/* Use PlayerSidebar instead of PlayersList */}
      <PlayerSidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
          Player Auction
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-gray-200">Teams</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
