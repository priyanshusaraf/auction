"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import PlayerCard from "./PlayerCard";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TeamCard({ team }) {
  const { isSignedIn } = useUser();
  const addPlayerToTeam = useAuctionStore((state) => state.addPlayerToTeam);
  const removePlayerFromTeam = useAuctionStore(
    (state) => state.removePlayerFromTeam
  );
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");

  if (!team) {
    return (
      <div className="p-4 bg-white shadow-md rounded-lg text-gray-500">
        Loading team...
      </div>
    );
  }

  const handleDrop = (e) => {
    if (!isSignedIn) return;

    e.preventDefault();
    const playerId = e.dataTransfer.getData("playerId");

    const player = useAuctionStore
      .getState()
      .players.find((p) => p.id === playerId);
    if (!player) return;

    setSelectedPlayer(player);
    setBidPrice(player.price.toString()); // ✅ Default to base price
    setError(""); // Reset error on open
  };

  const confirmBid = () => {
    const bid = parseInt(bidPrice, 10);

    if (isNaN(bid) || bid <= 0) {
      setError("Please enter a valid number.");
      return;
    }
    if (bid < selectedPlayer.price) {
      setError(
        `Bid must be at least ${selectedPlayer.price.toLocaleString()}.`
      );
      return;
    }
    if (bid > team.budget) {
      setError("Bid exceeds the team's budget.");
      return;
    }

    addPlayerToTeam(team.id, selectedPlayer.id, bid);
    setSelectedPlayer(null);
    setBidPrice(""); // Reset modal
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      confirmBid(); // ✅ Pressing Enter/Return triggers bid confirmation
    }
  };

  return (
    <>
      <div
        className={`p-4 bg-white shadow-md rounded-lg min-h-[200px] border ${
          isSignedIn ? "border-blue-500" : "border-gray-300"
        }`}
        onDragOver={(e) => isSignedIn && e.preventDefault()}
        onDrop={isSignedIn ? handleDrop : undefined}
      >
        <h3 className="text-lg font-bold">{team.name}</h3>
        <p className="text-sm text-gray-500">
          Budget: {team.budget.toLocaleString()}
        </p>

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
            <p className="text-gray-400 italic">No players in this team yet.</p>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <Dialog
        open={!!selectedPlayer}
        onOpenChange={() => setSelectedPlayer(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Bid for {selectedPlayer?.name}</DialogTitle>
            <DialogDescription>
              Base price:{" "}
              <strong>{selectedPlayer?.price.toLocaleString()}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* Bid Input */}
          <div className="flex flex-col gap-2">
            <Label>Bid Amount</Label>
            <Input
              type="number"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              onKeyDown={handleKeyDown} // ✅ Pressing Enter confirms bid
              min={selectedPlayer?.price}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
            {/* ✅ Show error inside modal */}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
              Cancel
            </Button>
            <Button onClick={confirmBid} disabled={!!error}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
