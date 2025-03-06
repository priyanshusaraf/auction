// types.ts

/** Player type */
export interface Player {
  id: string;
  name: string;
  category: "A+" | "A" | "B" | "C" | "D";
  price: number;
  available: boolean;
}

/** Team type */
export interface Team {
  id: string;
  name: string;
  budget: number;
  players: Player[];
}

/** Zustand Store Type */
export interface AuctionStore {
  players: Player[];
  teams: Team[];
  searchQuery: string;
  fetchPlayers: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  addPlayerToTeam: (teamId: string, playerId: string) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
}
