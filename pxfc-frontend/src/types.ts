/** Player type */
export interface Player {
  id: string;
  name: string;
  profilePhoto?: string | Blob; // Make profilePhoto optional
  category: "A+" | "A" | "B" | "C" | "D";
  price: number;
  bidAmount?: number; // Add bidAmount for tracking auction bids
  sold: boolean; // Renamed from 'available' for clarity (sold=true means not available)
  teamId?: string; // Add teamId to track which team owns the player
  wins?: number; // Make optional as it might not always be provided
  experience?: string; // Make optional
  rating?: string; // Make optional
  bidTime?: string; // Add optional bidTime to track when bid was placed
}

/** Team type */
export interface Team {
  id: string;
  name: string;
  budget: number;
  owner_id?: string; // Add optional owner_id to match backend
  players: Player[];
  initialBudget?: number; // Track initial budget for calculations
}

/** Zustand Store Type */
export interface AuctionStore {
  players: Player[];
  teams: Team[];
  availablePlayers?: Player[]; // Players not yet sold/assigned to teams
  searchQuery: string;
  loading: boolean; // Add loading state
  error: string | null; // Add error state

  // Methods
  fetchInitialData: () => Promise<void>; // Fetch both players and teams
  fetchPlayers: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  addPlayerToTeam: (teamId: string, playerId: string, bidPrice: number) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
  updateTeamData: (team: Team) => void; // Update a team's data
  markPlayerAsSold: (
    playerId: string,
    teamId: string,
    bidAmount?: number
  ) => void; // Mark player as sold
  getTeamById: (teamId: string) => Team | undefined;
  getPlayerById: (playerId: string) => Player | undefined;
  getAvailablePlayers: () => Player[];
  calculateTeamStats: (teamId: string) => {
    spent: number;
    remaining: number;
    total: number;
    percentUsed: number;
    playerCount: number;
  } | null;
}
