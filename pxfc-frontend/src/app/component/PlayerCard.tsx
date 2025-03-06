// components/PlayerCard.tsx
import { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  onRemove: () => void;
}

export default function PlayerCard({ player, onRemove }: PlayerCardProps) {
  return (
    <div className="flex justify-between p-2 bg-gray-200 rounded-md">
      <span>
        {player.name} - {player.price}
      </span>
      <button onClick={onRemove} className="text-red-500">
        ✖
      </button>
    </div>
  );
}
