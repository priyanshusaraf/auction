// components/PlayerCard.tsx
import { Player } from "@/types";
import { X, Lock } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onRemove: () => void;
  isReadOnly?: boolean;
}

export default function PlayerCard({
  player,
  onRemove,
  isReadOnly = false,
}: PlayerCardProps) {
  // Display bid amount if available, otherwise display base price
  const displayAmount = player.bidAmount || player.price;

  return (
    <div
      className={`flex justify-between items-center p-3 bg-white border rounded-md transition-all ${
        isReadOnly
          ? "border-gray-100 shadow-sm"
          : "border-gray-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">{player.name}</span>
        <div className="flex items-center">
          <span className="text-sm text-blue-600">
            {displayAmount?.toLocaleString()} {player.bidAmount ? "(Bid)" : ""}
          </span>
          {player.bidTime && (
            <span className="text-xs text-gray-400 ml-2">
              {formatDate(new Date(player.bidTime))}
            </span>
          )}
        </div>
      </div>
      {isReadOnly ? (
        <div className="text-gray-300 p-1">
          <Lock size={14} />
        </div>
      ) : (
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"
          aria-label="Remove player"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
