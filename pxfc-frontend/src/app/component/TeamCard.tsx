"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { socket, connectSocket } from "@/config/socketClient";
import { toast } from "react-hot-toast";

// Stable ID generator that doesn't reset on hydration
let uniqueIdCounter = 0;
const getUniqueId = () => `dynamic-id-${uniqueIdCounter++}`;

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
  } = useAuctionStore();

  // Client-side state to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [isDropActive, setIsDropActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localTeamPlayers, setLocalTeamPlayers] = useState([]);
  const [localTeamBudget, setLocalTeamBudget] = useState(0);
  const [initialBudget, setInitialBudget] = useState(0);
  const [socketStatus, setSocketStatus] = useState("connected");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [playerIds, setPlayerIds] = useState(new Set()); // Track added player IDs

  // Ensure we run client-side only code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Process team data ensuring we have stable, unique IDs and prevent duplication
  const processTeamPlayers = useCallback((players = []) => {
    if (!Array.isArray(players)) return [];
    
    // Create a unique map by player ID
    const playerMap = new Map();
    
    players.forEach((player, index) => {
      // Ensure player has an ID
      const playerId = player.id ? player.id.toString() : `unknown-${index}`;
      
      // Only add if not already in the map
      if (!playerMap.has(playerId)) {
        // Create a processed player with stable uniqueKey
        playerMap.set(playerId, {
          ...player,
          id: playerId,
          uniqueKey: `player-${playerId}`
        });
      }
    });
    
    // Return array of unique players
    return Array.from(playerMap.values());
  }, []);

  // Update local state when team prop changes
  useEffect(() => {
    if (!team || typeof window === 'undefined') return;
    
    // Parse budget values
    const availableBudget = parseFloat(String(team.budget)) || 0;
    const totalInitialBudget = parseFloat(String(team.initial_budget)) || 650000;
    
    // Process team players for deduplication
    const processedPlayers = processTeamPlayers(team.players || []);
    
    // Update player IDs set for tracking
    setPlayerIds(new Set(processedPlayers.map(p => p.id)));
    
    // Update local state with processed players
    setLocalTeamPlayers(processedPlayers);
    setLocalTeamBudget(availableBudget);
    setInitialBudget(totalInitialBudget);
    
  }, [team, processTeamPlayers]);

  // Setup socket connection status tracking
  useEffect(() => {
    if (typeof window === 'undefined' || !socketRef.current) return;
    
    const handleConnect = () => setSocketStatus("connected");
    const handleDisconnect = () => setSocketStatus("disconnected");
    
    connectSocket();
    setSocketStatus(socketRef.current.connected ? "connected" : "disconnected");
    
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect", handleConnect);
        socketRef.current.off("disconnect", handleDisconnect);
      }
    };
  }, []);

  // Handle socket updates for this team
  useEffect(() => {
    if (typeof window === 'undefined' || !socketRef.current || !team?.id) return;

    const handleUpdate = (data) => {
      console.log(`[TeamCard ${team.id}] Socket update:`, data);
      setLastUpdate(new Date().toISOString());

      // For BID_ACCEPTED updates
      if (data.type === "BID_ACCEPTED" && data.playerData?.teamId === team.id) {
        const playerId = data.playerData.id.toString();
        
        // Check if player already exists in our tracking set
        if (!playerIds.has(playerId)) {
          // Add to tracking set
          setPlayerIds(prev => {
            const newSet = new Set(prev);
            newSet.add(playerId);
            return newSet;
          });
          
          // Add player to local team
          setLocalTeamPlayers(prev => {
            // Final safety check to prevent duplication
            if (prev.some(p => p.id === playerId)) return prev;
            
            return [...prev, {
              ...data.playerData,
              uniqueKey: `player-${playerId}`
            }];
          });
          
          // Update local budget
          if (data.playerData.bidAmount) {
            setLocalTeamBudget(prev => prev - parseFloat(String(data.playerData.bidAmount)));
          }
        }
      }
      
      // For PLAYER_REMOVED updates
      if (data.type === "PLAYER_REMOVED" && data.playerData) {
        const playerId = data.playerData.id.toString();
        
        // Check if player is in this team
        if (playerIds.has(playerId)) {
          // Find player to get bid amount for budget restoration
          const player = localTeamPlayers.find(p => p.id === playerId);
          const bidAmount = player ? parseFloat(String(player.bidAmount || player.price)) : 0;
          
          // Remove player from tracking
          setPlayerIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(playerId);
            return newSet;
          });
          
          // Remove player from local team
          setLocalTeamPlayers(prev => prev.filter(p => p.id !== playerId));
          
          // Restore budget
          setLocalTeamBudget(prev => prev + bidAmount);
        }
      }

      // Handle team data updates
      if (data.teamData && data.teamData.id === team.id) {
        console.log(`[TeamCard ${team.id}] Processing team data:`, data.teamData);
        
        // Update budget if provided
        if (data.teamData.budget !== undefined) {
          setLocalTeamBudget(parseFloat(String(data.teamData.budget)));
        }
        
        // Update team players with deduplication
        if (data.teamData.players && Array.isArray(data.teamData.players)) {
          const processedPlayers = processTeamPlayers(data.teamData.players);
          
          // Update tracking set
          setPlayerIds(new Set(processedPlayers.map(p => p.id)));
          
          // Update local players
          setLocalTeamPlayers(processedPlayers);
        }

        // Update global store if authenticated
        if (isSignedIn) {
          updateTeamData(data.teamData);
        }
      }
    };

    socketRef.current.on("auctionUpdate", handleUpdate);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("auctionUpdate", handleUpdate);
      }
    };
  }, [team?.id, isSignedIn, updateTeamData, localTeamPlayers, processTeamPlayers, playerIds]);

  // Loading state
  if (!team) {
    return (
      <div className={`p-6 ${darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-500"} shadow-md rounded-lg flex items-center justify-center`}>
        <Loader className="animate-spin mr-2" size={20} />
        <span>Loading team...</span>
      </div>
    );
  }

  // Event handlers for drag and drop
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

    // Get player ID from drag data
    const playerId = e.dataTransfer.getData("playerId");
    if (!playerId) {
      console.error("No player ID found in drag data");
      return;
    }

    // Critical duplication check
    if (playerIds.has(playerId)) {
      toast.error("This player is already in your team");
      return;
    }

    // Find player from store
    const player = players.find(p => p.id.toString() === playerId);
    if (!player) {
      console.error("Player not found:", playerId);
      return;
    }

    // Check if player is already sold
    if (player.sold) {
      toast.error("This player has already been sold");
      return;
    }

    // Check budget
    const playerPrice = parseFloat(String(player.price));
    if (isNaN(playerPrice)) {
      console.error("Invalid player price:", player.price);
      return;
    }

    if (playerPrice > localTeamBudget) {
      toast.error("Not enough budget to add this player");
      return;
    }

    // Open bid modal
    setSelectedPlayer({
      ...player,
      bidAmount: playerPrice,
      sold: true,
      teamId: team.id
    });
    setBidPrice(playerPrice.toString());
    setError("");
  };

  // Handle bid confirmation
  const confirmBid = async () => {
    if (!selectedPlayer) return;

    const bid = parseFloat(bidPrice);
    const playerId = selectedPlayer.id.toString();
    
    // Validate bid
    if (isNaN(bid) || bid <= 0) {
      setError("Please enter a valid number.");
      return;
    }

    const minPrice = parseFloat(String(selectedPlayer.price));
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

      // Final duplication check
      if (playerIds.has(playerId)) {
        setError("This player is already in your team.");
        return;
      }

      // Add to tracking set
      setPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.add(playerId);
        return newSet;
      });
      
      // Optimistically update UI
      const playerWithBid = {
        ...selectedPlayer,
        bidAmount: bid,
        bidTime: new Date().toISOString(),
        uniqueKey: `player-${playerId}`
      };
      
      setLocalTeamPlayers(prev => [...prev, playerWithBid]);
      setLocalTeamBudget(prev => prev - bid);

      // Send to server
      await addPlayerToTeam(team.id, playerId, bid);
      toast.success(`Added ${selectedPlayer.name} to team`);
    } catch (error) {
      console.error("Bid error:", error);
      
      // Remove from tracking on error
      setPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
      
      // Revert optimistic updates
      setLocalTeamPlayers(prev => prev.filter(p => p.id !== playerId));
      setLocalTeamBudget(prev => prev + bid);
      
      const errorMsg = error.response?.data?.message || "Error placing bid";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  };

  // Handle Enter key in bid input
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !error && !isSubmitting) {
      confirmBid();
    }
  };

  // Close the bid modal
  const closeModal = () => {
    setSelectedPlayer(null);
    setBidPrice("");
    setError("");
  };

  // Calculate team stats
  const calculateSpent = () => {
    // Calculate spent amount using local team players
    if (!localTeamPlayers.length) return 0;

    return localTeamPlayers.reduce((total, player) => {
      // Always use bidAmount if available
      const amount = parseFloat(String(player.bidAmount || player.price)) || 0;
      return total + amount;
    }, 0);
  };

  const spentAmount = calculateSpent();

  // Calculate budget percentage
  const spentPercentage = initialBudget > 0 ? (spentAmount / initialBudget) * 100 : 0;

  // Handle player removal with improved error handling
  const handleRemovePlayer = async (playerId) => {
    if (!isSignedIn) return;

    // Ensure playerId is string
    const playerIdStr = playerId.toString();
    
    // Find the player to be removed
    const playerToRemove = localTeamPlayers.find(p => p.id === playerIdStr);
    if (!playerToRemove) {
      console.error("Cannot find player to remove:", playerIdStr);
      return;
    }

    // Calculate bid amount for budget restoration
    const bidAmount = parseFloat(String(playerToRemove.bidAmount || playerToRemove.price)) || 0;

    // Remove from tracking first
    setPlayerIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(playerIdStr);
      return newSet;
    });
    
    // Optimistically update UI
    setLocalTeamPlayers(prev => prev.filter(p => p.id !== playerIdStr));
    setLocalTeamBudget(prev => prev + bidAmount);

    // Call API to update server
    try {
      await removePlayerFromTeam(team.id, playerIdStr);
      toast.success(`Removed ${playerToRemove.name} from the team`);
    } catch (error) {
      console.error("Error removing player:", error);
      
      // Add back to tracking
      setPlayerIds(prev => {
        const newSet = new Set(prev);
        newSet.add(playerIdStr);
        return newSet;
      });
      
      // Revert local updates
      setLocalTeamPlayers(prev => [...prev, playerToRemove]);
      setLocalTeamBudget(prev => prev - bidAmount);

      // Show error notification with specific message
      const errorMsg = error.response?.data?.message || "Server error: Failed to remove player";
      toast.error(errorMsg);
    }
  };

  // Function to sort players by category
  const sortPlayersByCategory = (players) => {
    // Define category priority (highest to lowest)
    const categoryPriority = {
      'A+': 1,
      'A': 2,
      'B': 3,
      'C': 4,
      'D': 5,
      // Default for any other category
      'default': 99
    };

    return [...players].sort((a, b) => {
      // Get priority, defaulting to lowest if category not in the list
      const priorityA = categoryPriority[a.category] || categoryPriority.default;
      const priorityB = categoryPriority[b.category] || categoryPriority.default;
      
      // Sort primarily by category
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same category, sort by name as secondary sorting criterion
      return a.name.localeCompare(b.name);
    });
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
        {/* Team Header */}
        <div
          className={`bg-gradient-to-r ${
            darkMode
              ? "from-blue-900 to-indigo-900"
              : "from-blue-600 to-blue-800"
          } p-3 text-white`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <UserRound className="mr-2 text-blue-200" size={20} />
              <h3 className="text-lg font-bold truncate">{team.name}</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-1 rounded-full bg-blue-700 hover:bg-blue-600 transition"
                title="Team Statistics"
              >
                <Users size={14} />
              </button>
              {isClient && socketStatus === "disconnected" && (
                <button
                  onClick={() => connectSocket()}
                  className="p-1 rounded-full bg-blue-700 hover:bg-blue-600 transition"
                  title="Reconnect socket"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <div className="bg-blue-700 px-2 py-0.5 rounded-full flex items-center">
                <Coins className="text-blue-300 mr-1" size={14} />
                <span className="font-medium text-sm">
                  {parseFloat(String(localTeamBudget)).toLocaleString()} /{" "}
                  {parseFloat(String(initialBudget)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>
                Budget Used: {parseFloat(String(spentAmount)).toLocaleString()}
              </span>
              <span>
                {isNaN(spentPercentage) ? "0" : spentPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${isNaN(spentPercentage) ? 0 : spentPercentage}%`,
                }}
                transition={{ duration: 0.5 }}
                className={`h-1.5 rounded-full ${
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

        {/* Team Stats Panel */}
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
              } p-3 border-b`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Award
                    className={`${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    } mr-2`}
                    size={16}
                  />
                  <h4
                    className={`font-semibold text-sm ${
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

              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-white"
                  } p-2 rounded shadow-sm`}
                >
                  <div
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } text-xs`}
                  >
                    Players
                  </div>
                  <div
                    className={`text-lg font-semibold ${
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
                    } text-xs`}
                  >
                    Avg. Bid
                  </div>
                  <div
                    className={`text-lg font-semibold ${
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
                    } text-xs`}
                  >
                    Remaining
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      darkMode ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    {parseFloat(String(localTeamBudget)).toLocaleString()}
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
                  } mb-1 text-xs`}
                >
                  Category Distribution
                </div>
                <div className="flex flex-wrap gap-1 pb-1">
                  {Object.entries(teamStats.categories).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className={`${
                          darkMode ? "bg-gray-600" : "bg-blue-100"
                        } px-1.5 py-0.5 rounded text-xs`}
                      >
                        <span
                          className={`${
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

        {/* Main content area */}
        <div className="p-3">
          {/* Empty state */}
          {localTeamPlayers.length === 0 && (
            <div
              className={`border-2 border-dashed ${
                darkMode
                  ? "border-gray-600 bg-gray-800"
                  : "border-gray-300 bg-gray-50"
              } rounded-lg p-5 text-center my-2`}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  repeat: isDropActive ? Infinity : 0,
                  duration: 1,
                }}
              >
                <p className={`${darkMode ? "text-gray-400" : "text-gray-400"} text-sm`}>
                  {isSignedIn
                    ? "Drag players here to add to team"
                    : "Sign in to manage team players"}
                </p>
              </motion.div>
            </div>
          )}

          {/* Player list - sorted by category */}
          <div className="mt-1 space-y-2 max-h-[300px] overflow-y-auto">
            {localTeamPlayers.length > 0 ? (
              <AnimatePresence>
                {sortPlayersByCategory(localTeamPlayers).map((player) => (
                  <motion.div
                    key={player.uniqueKey || `player-${player.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
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
                className={`text-center py-3 ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                } text-sm`}
              >
                No players in this team yet
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bid Modal */}
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
                {parseFloat(
                  String(selectedPlayer?.price || 0)
                ).toLocaleString()}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Bid Input */}
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
                  ? `Min: ${parseFloat(
                      String(selectedPlayer.price)
                    ).toLocaleString()}`
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

            {/* Budget indicator */}
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
                  {parseFloat(String(localTeamBudget)).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
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