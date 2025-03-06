"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PlayerSidebar() {
  const { isSignedIn } = useUser();
  const { searchQuery, setSearchQuery, availablePlayers } = useAuctionStore();
  const filteredPlayers = availablePlayers();
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <>
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
                onClick={() => setSelectedPlayer(player)} // ✅ Clicking opens player details
                className={`p-3 rounded-md flex items-center gap-3 cursor-pointer bg-gray-100 hover:bg-gray-200 transition`}
              >
                <Image
                  src={player.profilePhoto}
                  alt={player.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <span>
                  {player.name} - {player.category}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No players available.</p>
          )}
        </div>
      </div>

      {/* Player Stats Modal */}
      <Dialog
        open={!!selectedPlayer}
        onOpenChange={() => setSelectedPlayer(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Image
                    src={selectedPlayer.profilePhoto}
                    alt={selectedPlayer.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  {selectedPlayer.name}
                </DialogTitle>
                <DialogDescription>
                  Category: {selectedPlayer.category}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <p>
                  <strong>Experience:</strong> {selectedPlayer.experience}
                </p>
                <p>
                  <strong>Previous Wins:</strong> {selectedPlayer.wins}
                </p>
                <p>
                  <strong>Overall Rating:</strong> {selectedPlayer.rating}
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
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
