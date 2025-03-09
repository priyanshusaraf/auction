"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import PlayerCard from "./PlayerCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader, Coins, UserRound, AlertCircle } from "lucide-react";

export default function TeamCard({ team }) {
  const { isSignedIn } = useUser();
  const addPlayerToTeam = useAuctionStore((state) => state.addPlayerToTeam);
  const removePlayerFromTeam = useAuctionStore(
    (state) => state.removePlayerFromTeam
  );
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [isDropActive, setIsDropActive] = useState(false);

  if (!team) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg text-gray-500 flex items-center justify-center">
        <Loader className="animate-spin mr-2" size={20} />
        <span>Loading team...</span>
      </div>
    );
  }

  const handleDragOver = (e) => {
    if (!isSignedIn) return;
    e.preventDefault();
    setIsDropActive(true);
  };

  const handleDragLeave = () => {
    setIsDropActive(false);
  };

  const handleDrop = (e) => {
    if (!isSignedIn) return;

    e.preventDefault();
    setIsDropActive(false);
    const playerId = e.dataTransfer.getData("playerId");

    const player = useAuctionStore
      .getState()
      .players.find((p) => p.id === playerId);
    if (!player) return;

    setSelectedPlayer(player);
    setBidPrice(player.price.toString());
    setError("");
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
    closeModal();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !error) {
      confirmBid();
    }
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setBidPrice("");
    setError("");
  };

  const calculateSpent = () => {
    // Ensure all players have a bidAmount property
    return team.players.reduce((total, player) => {
      // Use bidAmount if it exists, otherwise fall back to player.price
      const amount = player.bidAmount || player.price || 0;
      return total + amount;
    }, 0);
  };

  const spentAmount = calculateSpent();

  // Make sure we have a valid budget value
  const totalBudget =
    (team.budget || 0) + (team.initialBudget ? 0 : spentAmount);
  const spentPercentage =
    totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-6 bg-gradient-to-b from-white to-gray-50 shadow-lg rounded-lg min-h-[220px] border-2 transition-all duration-300 ${
          isDropActive
            ? "border-blue-400 shadow-blue-100"
            : isSignedIn
            ? "border-blue-200 hover:border-blue-300"
            : "border-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={isSignedIn ? handleDrop : undefined}
        style={{
          transform: isDropActive ? "scale(1.02)" : "scale(1)",
        }}
      >
        {/* Team Header with Gradient and Icons */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <UserRound className="mr-2 text-blue-500" size={20} />
              {team.name}
            </h3>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center">
            <Coins className="text-blue-500 mr-1" size={16} />
            <span className="text-blue-700 font-medium">
              {team.budget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Budget Used: {spentAmount.toLocaleString()}</span>
            <span>
              {isNaN(spentPercentage) ? "0" : spentPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${isNaN(spentPercentage) ? 0 : spentPercentage}%`,
              }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${
                spentPercentage > 80
                  ? "bg-red-500"
                  : spentPercentage > 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            ></motion.div>
          </div>
        </div>

        {/* Drop Zone Indicator when empty */}
        {team.players.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center my-4 bg-gray-50">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: isDropActive ? Infinity : 0, duration: 1 }}
            >
              <p className="text-gray-400">
                {isSignedIn
                  ? "Drag players here to add to team"
                  : "Sign in to manage team players"}
              </p>
            </motion.div>
          </div>
        )}

        {/* Player List with animations */}
        <div className="mt-4 space-y-3">
          {team.players.length > 0
            ? team.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <PlayerCard
                    player={player}
                    onRemove={() =>
                      isSignedIn && removePlayerFromTeam(team.id, player.id)
                    }
                  />
                </motion.div>
              ))
            : null}
        </div>
      </motion.div>

      {/* Bid Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              {selectedPlayer?.name}
              <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedPlayer?.category}
              </span>
            </DialogTitle>
            <DialogDescription className="flex items-center">
              <span>Starting bid:</span>
              <span className="font-semibold text-blue-600 ml-1">
                {selectedPlayer?.price?.toLocaleString()}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Bid Input with animation */}
          <motion.div
            className="flex flex-col gap-3 my-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label className="text-gray-700">Your Bid Amount</Label>
            <Input
              type="number"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              min={selectedPlayer?.price}
              className={`text-lg py-6 ${
                error
                  ? "border-red-400 focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
              placeholder={`Min: ${selectedPlayer?.price}`}
              autoFocus
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm flex items-center"
              >
                <AlertCircle size={14} className="mr-1" /> {error}
              </motion.p>
            )}

            {/* Team budget indicator */}
            <div className="bg-gray-50 p-3 rounded-md mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Team Budget:</span>
                <span className="font-medium">
                  {team.budget.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={confirmBid}
                disabled={!!error || !bidPrice}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Bid
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
