import { Player } from "@/types";
import { X, Lock, User, Zap, DollarSign, Award } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface PlayerCardProps {
  player: Player;
  onRemove: () => void;
  isReadOnly?: boolean;
  darkMode?: boolean;
}

export default function PlayerCard({
  player,
  onRemove,
  isReadOnly = false,
  darkMode = false,
}: PlayerCardProps) {
  // State to track whether card is being hovered
  const [isHovered, setIsHovered] = React.useState(false);

  // Display bid amount if available, otherwise display base price
  // Ensure it's parsed as a number to avoid display issues
  const displayAmount =
    parseFloat(String(player.bidAmount || player.price)) || 0;
  const formattedAmount = displayAmount.toLocaleString();

  // Determine player category styles
  const getCategoryColor = (category: string) => {
    if (darkMode) {
      switch (category) {
        case "A+":
          return "bg-purple-900 text-purple-200 border-purple-700";
        case "A":
          return "bg-indigo-900 text-indigo-200 border-indigo-700";
        case "B":
          return "bg-blue-900 text-blue-200 border-blue-700";
        case "C":
          return "bg-green-900 text-green-200 border-green-700";
        case "D":
          return "bg-yellow-900 text-yellow-200 border-yellow-700";
        default:
          return "bg-gray-700 text-gray-200 border-gray-600";
      }
    } else {
      switch (category) {
        case "A+":
          return "bg-purple-100 text-purple-600 border-purple-200";
        case "A":
          return "bg-indigo-100 text-indigo-600 border-indigo-200";
        case "B":
          return "bg-blue-100 text-blue-600 border-blue-200";
        case "C":
          return "bg-green-100 text-green-600 border-green-200";
        case "D":
          return "bg-yellow-100 text-yellow-600 border-yellow-200";
        default:
          return "bg-gray-100 text-gray-600 border-gray-200";
      }
    }
  };

  // Add drag start handler
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly || player.sold) return;

    // Set the player ID in the data transfer
    e.dataTransfer.setData("playerId", player.id);
    e.dataTransfer.effectAllowed = "move";

    // Log for debugging
    console.log("Dragging player:", player.id, player.name);
  };

  // Get timestamp of when player was added
  const getTimeSince = () => {
    if (!player.bidTime) return null;

    const bidTime = new Date(player.bidTime);
    const now = new Date();
    const diffMs = now.getTime() - bidTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      draggable={!isReadOnly && !player.sold}
      onDragStart={handleDragStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex justify-between items-center p-3 ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white"
          : "bg-white border-gray-200"
      } rounded-lg transition-all ${
        isReadOnly
          ? darkMode
            ? "border-gray-600 shadow-sm"
            : "border-gray-100 shadow-sm"
          : player.sold
          ? darkMode
            ? "border-gray-600 shadow-sm cursor-default"
            : "border-gray-100 shadow-sm cursor-default"
          : darkMode
          ? "border-gray-600 shadow-sm hover:shadow-md cursor-grab"
          : "border-gray-200 shadow-sm hover:shadow-md cursor-grab"
      }`}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.01 }}
      animate={{
        borderColor: isHovered
          ? darkMode
            ? "#4B5563"
            : "#3B82F6"
          : darkMode
          ? "rgb(75, 85, 99)"
          : "rgb(229, 231, 235)",
        boxShadow: isHovered
          ? darkMode
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.15)"
            : "0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)"
          : "none",
      }}
    >
      {/* Player icon and category badge */}
      <div className="flex items-center mr-3">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${getCategoryColor(
            player.category
          )}`}
        >
          <User size={20} className="opacity-70" />
        </div>
      </div>

      {/* Player information */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center">
          <span
            className={`font-semibold ${
              darkMode ? "text-gray-200" : "text-gray-800"
            } truncate`}
          >
            {player.name}
          </span>
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(
              player.category
            )}`}
          >
            {player.category}
          </span>
        </div>
        <div className="flex items-center mt-0.5">
          <div
            className={`flex items-center ${
              darkMode ? "text-blue-300" : "text-blue-600"
            }`}
          >
            <DollarSign size={14} className="opacity-70 mr-0.5" />
            <span className="text-sm font-medium">
              {formattedAmount} {player.bidAmount ? "(Bid)" : ""}
            </span>
          </div>
          {player.rating && (
            <div
              className={`flex items-center ${
                darkMode ? "text-amber-300" : "text-amber-500"
              } ml-2`}
            >
              <Award size={14} className="opacity-70 mr-0.5" />
              <span className="text-xs">{player.rating}</span>
            </div>
          )}
          {player.bidTime && (
            <div className="text-xs text-gray-400 ml-2 flex items-center">
              <Zap size={12} className="mr-0.5" />
              {getTimeSince()}
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div>
        {isReadOnly ? (
          <div
            className={`${darkMode ? "text-gray-500" : "text-gray-300"} p-1`}
          >
            <Lock size={14} />
          </div>
        ) : (
          <motion.button
            onClick={onRemove}
            whileHover={{
              scale: 1.1,
              backgroundColor: darkMode
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(254, 226, 226, 0.7)",
            }}
            whileTap={{ scale: 0.95 }}
            className={`${
              darkMode
                ? "text-gray-400 hover:text-red-400"
                : "text-gray-400 hover:text-red-500"
            } rounded-full p-1.5 transition-colors`}
            aria-label="Remove player"
          >
            <X size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
