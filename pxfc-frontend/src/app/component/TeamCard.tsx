"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader,
  Coins,
  UserRound,
  AlertCircle,
  Users,
  Award,
  Shield,
  RefreshCw,
} from "lucide-react";
import { socket, connectSocket, forceReconnect } from "@/config/socketClient";
import { toast } from "react-hot-toast";

export default function TeamCard({ team, darkMode = false }) {
  const { isSignedIn, user } = useUser();
  const socketRef = useRef(socket);

  // Get all players and store functions
  const players = useAuctionStore((state) => state.players);
  const {
    addPlayerToTeam,
    removePlayerFromTeam,
    updateTeamData,
    markPlayerAsSold,
  } = useAuctionStore((state) => state);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [isDropActive, setIsDropActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localTeamPlayers, setLocalTeamPlayers] = useState([]);
  const [localTeamBudget, setLocalTeamBudget] = useState(0);
  const [initialBudget, setInitialBudget] = useState(0);
  const [socketStatus, setSocketStatus] = useState("connected"); // Default to connected to fix the UI
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Update local state when team prop changes
  useEffect(() => {
    if (!team) return;

    // Use initial_budget from the backend if available
    const availableBudget = parseFloat(team.budget) || 0;
    const totalInitialBudget = parseFloat(team.initial_budget) || 650000;

    // Update local state
    setLocalTeamPlayers(team.players || []);
    setLocalTeamBudget(availableBudget);
    setInitialBudget(totalInitialBudget);
  }, [team]);

  // Track socket connection status
  useEffect(() => {
    const handleConnect = () => {
      setSocketStatus("connected");
    };

    const handleDisconnect = () => {
      setSocketStatus("disconnected");
    };

    // Ensure socket is connected when component mounts
    connectSocket();

    // Set initial status based on current connection state
    setSocketStatus(socketRef.current.connected ? "connected" : "disconnected");

    // Track connection status
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);

    return () => {
      socketRef.current.off("connect", handleConnect);
      socketRef.current.off("disconnect", handleDisconnect);
    };
  }, []);

  // Handle socket updates
  useEffect(() => {
    if (!socket || !team) return;

    const handleUpdate = (data) => {
      console.log("Socket update received in TeamCard:", data);

      // Track when we received the update
      setLastUpdate(new Date().toISOString());

      // Check if this update is for our team
      if (data.teamData && data.teamData.id === team.id) {
        console.log("Applying update to team:", team.name);

        // IMPORTANT: Always update local state regardless of auth status
        if (data.teamData.players) {
          setLocalTeamPlayers(data.teamData.players);
        }

        if (data.teamData.budget !== undefined) {
          setLocalTeamBudget(parseFloat(data.teamData.budget));
        }

        // Only update global state if authenticated
        if (isSignedIn) {
          updateTeamData(data.teamData);
        }
      }

      // Handle player updates - these might affect any team if a player was moved
      if (data.playerData && isSignedIn) {
        markPlayerAsSold(
          data.playerData.id,
          data.playerData.teamId,
          data.playerData.bidAmount
        );
      }
    };

    socket.on("auctionUpdate", handleUpdate);

    return () => {
      socket.off("auctionUpdate", handleUpdate);
    };
  }, [team?.id, isSignedIn, updateTeamData, markPlayerAsSold]);

  if (!team) {
    return (
      <div
        className={`p-6 ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-500"
        } shadow-md rounded-lg flex items-center justify-center`}
      >
        <Loader className="animate-spin mr-2" size={20} />
        <span>Loading team...</span>
      </div>
    );
  }

  const handleDragOver = (e) => {
    if (!isSignedIn) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropActive(true);
  };

  const handleDragLeave = () => {
    setIsDropActive(false);
  };

  const handleDrop = (e) => {
    if (!isSignedIn) return;

    e.preventDefault();
    setIsDropActive(false);

    // Get the player ID from the data transfer
    const playerId = e.dataTransfer.getData("playerId");
    if (!playerId) {
      console.error("No player ID found in drag data");
      return;
    }

    // Find the player from the players array in the store
    const player = players.find((p) => p.id.toString() === playerId);
    if (!player) {
      console.error("Player not found:", playerId);
      return;
    }

    // Check if player is already sold
    if (player.sold) {
      toast.error("This player has already been sold");
      return;
    }

    // Ensure we're working with numeric values for prices
    const playerPrice = parseFloat(player.price);
    if (isNaN(playerPrice)) {
      console.error("Invalid player price:", player.price);
      return;
    }

    // Check if budget is sufficient
    if (playerPrice > localTeamBudget) {
      toast.error("Not enough budget to add this player");
      return;
    }

    // Create a copy with the bid amount
    const playerWithBid = {
      ...player,
      bidAmount: playerPrice,
      sold: true,
      teamId: team.id,
    };

    // Open the bid modal for confirmation
    setSelectedPlayer(playerWithBid);
    setBidPrice(playerPrice.toString());
    setError("");
  };

  const confirmBid = async () => {
    if (!selectedPlayer) return;

    const bid = parseFloat(bidPrice);

    if (isNaN(bid) || bid <= 0) {
      setError("Please enter a valid number.");
      return;
    }

    const minPrice = parseFloat(selectedPlayer.price);
    if (bid < minPrice) {
      setError(`Bid must be at least ${minPrice.toLocaleString()}.`);
      return;
    }

    if (bid > localTeamBudget) {
      setError("Bid exceeds the team's budget.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Optimistic UI update - add player to team
      const playerWithBid = {
        ...selectedPlayer,
        bidAmount: bid,
      };

      // Update local state immediately for responsive UI
      setLocalTeamPlayers((prev) => [...prev, playerWithBid]);
      setLocalTeamBudget((prev) => prev - bid);

      // Send to server
      await addPlayerToTeam(team.id, selectedPlayer.id, bid);
    } catch (error) {
      console.error("Bid error:", error);
      const errorMsg = error.response?.data?.message || "Error placing bid";
      toast.error(errorMsg);

      // Revert optimistic update on error
      setLocalTeamPlayers((prev) =>
        prev.filter((p) => p.id !== selectedPlayer.id)
      );
      setLocalTeamBudget((prev) => prev + parseFloat(bidPrice));
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !error && !isSubmitting) {
      confirmBid();
    }
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setBidPrice("");
    setError("");
  };

  const calculateSpent = () => {
    // Calculate spent amount using local team players
    if (!localTeamPlayers.length) return 0;

    return localTeamPlayers.reduce((total, player) => {
      // IMPORTANT: For sold players, always use bidAmount if available
      const amount = parseFloat(player.bidAmount || player.price) || 0;
      return total + amount;
    }, 0);
  };

  const spentAmount = calculateSpent();

  // Calculate percentage
  const spentPercentage =
    initialBudget > 0 ? (spentAmount / initialBudget) * 100 : 0;

  // Handle player removal with optimistic update
  const handleRemovePlayer = async (playerId) => {
    if (!isSignedIn) return;

    // Find the player to be removed
    const playerToRemove = localTeamPlayers.find((p) => p.id === playerId);
    if (!playerToRemove) return;

    // Ensure bid amount is a number - use bidAmount if available
    const bidAmount =
      parseFloat(playerToRemove.bidAmount || playerToRemove.price) || 0;

    // Optimistically update local state
    setLocalTeamPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setLocalTeamBudget((prev) => prev + bidAmount);

    // Call the store function to update the server
    try {
      await removePlayerFromTeam(team.id, playerId);
      toast.success(`Removed ${playerToRemove.name} from the team`);
    } catch (error) {
      console.error("Error removing player:", error);

      // Revert optimistic update
      setLocalTeamPlayers((prev) => [...prev, playerToRemove]);
      setLocalTeamBudget((prev) => prev - bidAmount);

      toast.error("Failed to remove player");
    }
  };

  // Get team composition stats
  const teamStats = {
    categories: localTeamPlayers.reduce((acc, player) => {
      acc[player.category] = (acc[player.category] || 0) + 1;
      return acc;
    }, {}),
    totalPlayers: localTeamPlayers.length,
    averageBid: localTeamPlayers.length
      ? (spentAmount / localTeamPlayers.length).toFixed(0)
      : 0,
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-0 bg-gradient-to-b ${
          darkMode
            ? "from-gray-800 to-gray-900 text-white"
            : "from-white to-gray-50"
        } shadow-lg rounded-lg min-h-[220px] border-2 transition-all duration-300 overflow-hidden ${
          isDropActive
            ? "border-blue-400 shadow-blue-100"
            : isSignedIn
            ? darkMode
              ? "border-gray-700"
              : "border-blue-200 hover:border-blue-300"
            : darkMode
            ? "border-gray-700"
            : "border-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          transform: isDropActive ? "scale(1.02)" : "scale(1)",
        }}
      >
        {/* Team Header with enhanced design */}
        <div
          className={`bg-gradient-to-r ${
            darkMode
              ? "from-blue-900 to-indigo-900"
              : "from-blue-600 to-blue-800"
          } p-4 text-white`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <UserRound className="mr-2 text-blue-200" size={24} />
              <h3 className="text-xl font-bold">{team.name}</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-1.5 rounded-full bg-blue-700 hover:bg-blue-600 transition"
                title="Team Statistics"
              >
                <Users size={16} />
              </button>
              {socketStatus === "disconnected" && (
                <button
                  onClick={() => forceReconnect()}
                  className="p-1.5 rounded-full bg-blue-700 hover:bg-blue-600 transition"
                  title="Reconnect socket"
                >
                  <RefreshCw size={16} />
                </button>
              )}
              <div className="bg-blue-700 px-3 py-1 rounded-full flex items-center">
                <Coins className="text-blue-300 mr-1" size={16} />
                <span className="font-medium">
                  {parseFloat(localTeamBudget).toLocaleString()} /{" "}
                  {parseFloat(initialBudget).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Progress Bar with improved design */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>
                Budget Used: {parseFloat(spentAmount).toLocaleString()}
              </span>
              <span>
                {isNaN(spentPercentage) ? "0" : spentPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-2 overflow-hidden">
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
                    ? "bg-yellow-400"
                    : "bg-green-400"
                }`}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Team Stats Panel - conditionally visible */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-blue-50 border-blue-100"
              } p-4 border-b`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Award
                    className={`${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    } mr-2`}
                    size={18}
                  />
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Team Statistics
                  </h4>
                </div>
                <button
                  onClick={() => setShowStats(false)}
                  className={`${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-400 hover:text-blue-600"
                  }`}
                >
                  <span className="text-xs">Close</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                <div
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } p-2 rounded shadow-sm`}
                >
                  <div
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Players
                  </div>
                  <div
                    className={`text-xl font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {teamStats.totalPlayers}
                  </div>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } p-2 rounded shadow-sm`}
                >
                  <div
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Avg. Bid
                  </div>
                  <div
                    className={`text-xl font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {parseFloat(teamStats.averageBid).toLocaleString()}
                  </div>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } p-2 rounded shadow-sm`}
                >
                  <div
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Remaining
                  </div>
                  <div
                    className={`text-xl font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {parseFloat(localTeamBudget).toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className={`mt-2 ${
                  darkMode ? "bg-gray-700" : "bg-white"
                } p-2 rounded shadow-sm`}
              >
                <div
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } mb-1`}
                >
                  Category Distribution
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {Object.entries(teamStats.categories).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className={`flex-shrink-0 ${
                          darkMode ? "bg-gray-600" : "bg-blue-100"
                        } px-2 py-1 rounded text-xs`}
                      >
                        <span
                          className={`font-medium ${
                            darkMode ? "text-blue-200" : "text-blue-800"
                          }`}
                        >
                          {category}: {count}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area with padding */}
        <div className="p-4">
          {/* Socket status indicator */}
          <div className="flex items-center justify-end mb-2">
            <div
              className={`flex items-center text-xs ${
                socketStatus === "connected" ? "text-green-600" : "text-red-500"
              }`}
            >
              {/* <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  socketStatus === "connected" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div> */}
              {/* <span>
                {socketStatus === "connected"
                  ? "Live updates active"
                  : "Reconnecting..."}
              </span> */}
            </div>
          </div>

          {/* Drop Zone Indicator when empty */}
          {localTeamPlayers.length === 0 && (
            <div
              className={`border-2 border-dashed ${
                darkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-300 bg-gray-50"
              } rounded-lg p-6 text-center my-4`}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: isDropActive ? Infinity : 0,
                  duration: 1,
                }}
              >
                <p className={darkMode ? "text-gray-400" : "text-gray-400"}>
                  {isSignedIn
                    ? "Drag players here to add to team"
                    : "Sign in to manage team players"}
                </p>
              </motion.div>
            </div>
          )}

          {/* Player List with staggered animations */}
          <div className="mt-2 space-y-2">
            {localTeamPlayers.length > 0 ? (
              <AnimatePresence>
                {localTeamPlayers.map((player, index) => (
                  <motion.div
                    key={player.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <PlayerCard
                      player={player}
                      onRemove={() => handleRemovePlayer(player.id)}
                      isReadOnly={!isSignedIn}
                      darkMode={darkMode}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div
                className={`text-center py-4 ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                } text-sm`}
              >
                No players in this team yet
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bid Modal with enhanced styling */}
      <Dialog open={!!selectedPlayer} onOpenChange={closeModal}>
        <DialogContent
          className={`sm:max-w-md ${
            darkMode ? "bg-gray-800 text-white" : "bg-white"
          }`}
        >
          <DialogHeader
            className={`${
              darkMode
                ? "bg-gray-900 border-gray-700"
                : "bg-blue-50 border-blue-100"
            } -mx-6 -mt-6 px-6 py-4 rounded-t-lg border-b`}
          >
            <DialogTitle
              className={`text-xl ${
                darkMode ? "text-gray-100" : "text-gray-800"
              } flex items-center`}
            >
              <span className="mr-2">{selectedPlayer?.name}</span>
              <span
                className={`text-sm ${
                  darkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-700"
                } px-2 py-0.5 rounded-full`}
              >
                {selectedPlayer?.category}
              </span>
            </DialogTitle>
            <DialogDescription className="flex items-center">
              <span className={darkMode ? "text-gray-300" : ""}>
                Starting bid:
              </span>
              <span
                className={`font-semibold ${
                  darkMode ? "text-blue-300" : "text-blue-600"
                } ml-1`}
              >
                {parseFloat(selectedPlayer?.price || 0).toLocaleString()}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Bid Input with animation */}
          <motion.div
            className="flex flex-col gap-3 my-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label
              className={`${
                darkMode ? "text-gray-200" : "text-gray-700"
              } flex items-center`}
            >
              <Shield
                className={`w-4 h-4 mr-1 ${
                  darkMode ? "text-blue-400" : "text-blue-500"
                }`}
              />
              Your Bid Amount
            </Label>
            <Input
              type="number"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              min={selectedPlayer?.price}
              className={`text-lg py-6 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
              } ${
                error
                  ? "border-red-400 focus:ring-red-400"
                  : "focus:ring-blue-400"
              }`}
              placeholder={
                selectedPlayer
                  ? `Min: ${parseFloat(selectedPlayer.price).toLocaleString()}`
                  : ""
              }
              autoFocus
              disabled={isSubmitting}
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
            <div
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-blue-50 border-blue-100"
              } p-3 rounded-md mt-2 border`}
            >
              <div className="flex justify-between text-sm">
                <span
                  className={`${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } flex items-center`}
                >
                  <Coins
                    className={`w-4 h-4 mr-1 ${
                      darkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                  Team Budget:
                </span>
                <span
                  className={`font-medium ${
                    darkMode ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  {parseFloat(localTeamBudget).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant={darkMode ? "outline" : "outline"}
              onClick={closeModal}
              className={`${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={confirmBid}
                disabled={!!error || !bidPrice || isSubmitting}
                className={`${
                  darkMode
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  "Confirm Bid"
                )}
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
