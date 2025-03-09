"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProfilePhotoMock from "./ProfilePhotoMock";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import { socket } from "@/config/socketClient";

export default function PlayerSidebar() {
  const { isSignedIn } = useUser();
  // Add local state for search query since it might not be properly initialized in the store
  const [searchQuery, setLocalSearchQuery] = useState("");
  const { availablePlayers, setSearchQuery, players } = useAuctionStore();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Add local state to manage player availability for non-authenticated users
  const [localAvailablePlayers, setLocalAvailablePlayers] = useState([]);

  // Initialize localAvailablePlayers from store when component mounts
  useEffect(() => {
    if (availablePlayers && availablePlayers.length > 0) {
      setLocalAvailablePlayers(availablePlayers);
    } else if (players && players.length > 0) {
      // Fallback to filtering from all players if availablePlayers is not set
      const available = players.filter((p) => !p.sold);
      setLocalAvailablePlayers(available);
    }
  }, [availablePlayers, players]);

  // Listen for socket updates to update available players for non-authenticated users
  useEffect(() => {
    if (socket) {
      const handleAuctionUpdate = (data) => {
        console.log("PlayerSidebar received update:", data.type);

        // Handle all update types
        if (data.playerData) {
          // Update local available players list based on the player's sold status
          setLocalAvailablePlayers((prev) => {
            if (data.type === "BID_ACCEPTED") {
              // Remove the sold player
              return prev.filter((p) => p.id !== data.playerData.id);
            } else if (data.type === "PLAYER_REMOVED") {
              // Check if the player is already in our list
              const exists = prev.some((p) => p.id === data.playerData.id);
              if (!exists) {
                // Add the player back to available list
                return [...prev, data.playerData];
              }
            }
            return prev;
          });
        }
      };

      socket.on("auctionUpdate", handleAuctionUpdate);

      return () => {
        socket.off("auctionUpdate", handleAuctionUpdate);
      };
    }
  }, []);

  // Get all available players and filter them based on search query
  // Use local state for non-authenticated users and store state for authenticated users
  const allPlayers = isSignedIn
    ? availablePlayers || []
    : localAvailablePlayers;

  const filteredPlayers =
    searchQuery.trim() === ""
      ? allPlayers
      : allPlayers.filter((player) => {
          const query = searchQuery.toLowerCase();
          return (
            player.name.toLowerCase().includes(query) ||
            player.category.toLowerCase().includes(query) ||
            String(player.rating).includes(query) ||
            String(player.experience).toLowerCase().includes(query)
          );
        });

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    // Update the global state if setSearchQuery is available
    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  return (
    <>
      <div className="w-1/4 p-6 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl backdrop-blur-lg border border-gray-800 border-opacity-50 overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Players
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Drag players to auction board
          </p>
        </div>

        {/* Search Input with Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search by name, category, rating..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-gray-800 bg-opacity-50 border-gray-700 text-gray-200 pl-10 py-5 h-10 rounded-lg focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Player List - Glassmorphic Cards */}
        <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                draggable={isSignedIn}
                onDragStart={(e) =>
                  isSignedIn && e.dataTransfer.setData("playerId", player.id)
                }
                onClick={() => setSelectedPlayer(player)}
                className="p-4 rounded-lg flex items-center gap-4 cursor-pointer bg-gray-800 bg-opacity-40 backdrop-blur-sm border border-gray-700 border-opacity-40 hover:bg-opacity-60 hover:border-teal-500 hover:border-opacity-50 transition-all group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  {player.profilePhoto ? (
                    <Image
                      src={player.profilePhoto}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-teal-400 transition-all"
                    />
                  ) : (
                    <ProfilePhotoMock
                      name={player.name}
                      size={48}
                      className="ring-2 ring-gray-700 group-hover:ring-teal-400 transition-all"
                    />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium text-gray-200 truncate group-hover:text-teal-300 transition-colors">
                    {player.name}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-teal-300">
                      {player.category}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      Rating: {player.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-400">No players match your search</p>
              <p className="text-gray-500 text-sm mt-1">
                Try different keywords
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Stats Modal - Enhanced */}
      <Dialog
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-gray-200">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-full opacity-30"></div>
                    {selectedPlayer.profilePhoto ? (
                      <Image
                        src={selectedPlayer.profilePhoto}
                        alt={selectedPlayer.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover ring-2 ring-teal-500"
                      />
                    ) : (
                      <ProfilePhotoMock
                        name={selectedPlayer.name}
                        size={64}
                        className="ring-2 ring-teal-500"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                      {selectedPlayer.name}
                    </h3>
                    <DialogDescription className="text-gray-400">
                      {selectedPlayer.category}
                    </DialogDescription>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Experience</p>
                  <p className="text-xl font-medium text-gray-200">
                    {selectedPlayer.experience}
                  </p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Previous Wins</p>
                  <p className="text-xl font-medium text-gray-200">
                    {selectedPlayer.wins}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Overall Rating</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2.5 rounded-full"
                        style={{
                          width: `${(selectedPlayer.rating / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-teal-300 font-medium">
                      {selectedPlayer.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-600 hover:to-cyan-500 text-gray-900 font-medium border-none"
                  onClick={() => setSelectedPlayer(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
