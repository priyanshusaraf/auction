// Updated AuctionLogic.ts with error handling fixes for API endpoints
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Player, Team, AuctionStore } from "../../types";

// Updated to match the API URL format and handle environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Add global axios configuration for better error handling
axios.interceptors.request.use(
  (config) => {
    // Log all API requests when in development
    if (process.env.NODE_ENV === "development") {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    // Show error toast with detailed message
    const errorMessage =
      error.response?.data?.message ||
      "Network error. Please check your connection.";

    // Include status code if available
    const statusCode = error.response?.status
      ? ` (${error.response.status})`
      : "";
    toast.error(`${errorMessage}${statusCode}`);

    return Promise.reject(error);
  }
);

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      teams: [],
      players: [],
      availablePlayers: [],
      searchQuery: "",
      loading: false,
      error: null,

      // Initialize the store with data from the server
      fetchInitialData: async () => {
        set({ loading: true, error: null });
        try {
          console.log("Fetching initial data from:", API_URL);

          // Add timestamps to avoid caching issues
          const timestamp = new Date().getTime();

          // Load teams and players in parallel with better error handling
          const [teamsResponse, playersResponse] = await Promise.all([
            axios.get(`${API_URL}/teams?t=${timestamp}`).catch((error) => {
              console.error("Error fetching teams:", error);
              throw new Error(`Failed to load teams: ${error.message}`);
            }),
            axios.get(`${API_URL}/players?t=${timestamp}`).catch((error) => {
              console.error("Error fetching players:", error);
              throw new Error(`Failed to load players: ${error.message}`);
            }),
          ]);

          console.log("Teams response:", teamsResponse.data);
          console.log("Players response:", playersResponse.data);

          const teams = teamsResponse.data;
          const players = playersResponse.data;

          // Format players to match frontend expected structure
          const formattedPlayers = players.map((player: any) => ({
            id: player.id.toString(),
            name: player.name,
            category: player.category,
            price: player.price,
            sold: player.sold,
            teamId: player.teamId ? player.teamId.toString() : null,
            // Add default values for frontend fields if not provided by API
            profilePhoto: player.profilePhoto || undefined,
            wins: player.wins || 0,
            experience: player.experience || "Rookie",
            rating: player.rating || "5.0",
          }));

          // Format teams to match frontend expected structure
          const formattedTeams = teams.map((team: any) => ({
            id: team.id.toString(),
            name: team.name,
            budget: team.budget,
            owner_id: team.owner_id ? team.owner_id.toString() : undefined,
            // Ensure players array exists
            players: team.players
              ? team.players.map((p: any) => ({
                  id: p.id.toString(),
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  bidAmount: p.bidAmount,
                  sold: p.sold,
                  teamId: p.teamId ? p.teamId.toString() : null,
                  profilePhoto: p.profilePhoto || undefined,
                }))
              : [],
          }));

          // Filter available players
          const availablePlayers = formattedPlayers.filter(
            (player: Player) => !player.sold
          );

          set({
            teams: formattedTeams,
            players: formattedPlayers,
            availablePlayers,
            loading: false,
          });
        } catch (error: any) {
          console.error("Error fetching initial data:", error);

          // Get detailed error information
          const errorDetail = error.response?.data?.message || error.message;

          set({
            error: `Failed to load auction data: ${errorDetail}. Please refresh the page.`,
            loading: false,
          });
        }
      },

      // Fetch players
      fetchPlayers: async () => {
        try {
          const response = await axios.get(`${API_URL}/players`);
          const formattedPlayers = response.data.map((player: any) => ({
            id: player.id.toString(),
            name: player.name,
            category: player.category,
            price: player.price,
            sold: player.sold,
            teamId: player.teamId ? player.teamId.toString() : null,
            profilePhoto: player.profilePhoto || undefined,
            wins: player.wins || 0,
            experience: player.experience || "Rookie",
            rating: player.rating || "5.0",
          }));

          set({ players: formattedPlayers });

          // Update availablePlayers
          const availablePlayers = formattedPlayers.filter(
            (player: Player) => !player.sold
          );
          set({ availablePlayers });

          return formattedPlayers;
        } catch (error) {
          console.error("Error fetching players:", error);
          throw error;
        }
      },

      // Fetch teams
      fetchTeams: async () => {
        try {
          const response = await axios.get(`${API_URL}/teams`);
          const formattedTeams = response.data.map((team: any) => ({
            id: team.id.toString(),
            name: team.name,
            budget: team.budget,
            owner_id: team.owner_id ? team.owner_id.toString() : undefined,
            players: team.players
              ? team.players.map((p: any) => ({
                  id: p.id.toString(),
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  bidAmount: p.bidAmount,
                  sold: p.sold,
                  teamId: p.teamId ? p.teamId.toString() : null,
                  profilePhoto: p.profilePhoto || undefined,
                }))
              : [],
          }));

          set({ teams: formattedTeams });
          return formattedTeams;
        } catch (error) {
          console.error("Error fetching teams:", error);
          throw error;
        }
      },

      // Update a team's data (used when receiving socket updates)
      updateTeamData: (updatedTeam) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === updatedTeam.id
              ? {
                  ...updatedTeam,
                  // Ensure players array exists
                  players: updatedTeam.players || [],
                }
              : team
          ),
        }));
      },

      // Mark a player as sold
      markPlayerAsSold: (playerId, teamId, bidAmount) => {
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId
              ? {
                  ...player,
                  sold: true,
                  teamId: teamId,
                  bidAmount: bidAmount || player.price,
                }
              : player
          ),
          // Update availablePlayers as well
          availablePlayers: state.availablePlayers?.filter(
            (player) => player.id !== playerId
          ),
        }));
      },

      // Set search query
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Add a player to a team - FIXED API ENDPOINT
      addPlayerToTeam: async (teamId, playerId, bidAmount) => {
        try {
          // Log the request for debugging
          console.log("Adding player to team:", {
            teamId,
            playerId,
            bidAmount,
          });

          // Send bid to the server with full URL path
          const response = await axios.post(`${API_URL}/auction/bid`, {
            teamId,
            playerId,
            bidAmount,
          });

          if (response.data.success) {
            toast.success(`Bid accepted for player`);
            return response.data;
          } else {
            toast.error(response.data.message || "Failed to place bid");
            throw new Error(response.data.message || "Failed to place bid");
          }
        } catch (error) {
          console.error("Error adding player to team:", error);
          // Error handling is done by axios interceptor
          throw error;
        }
      },

      // Remove a player from a team - FIXED API ENDPOINT
      removePlayerFromTeam: async (teamId, playerId) => {
        try {
          // Log the request for debugging
          console.log("Removing player from team:", { teamId, playerId });

          // Make sure to stringify IDs if needed
          const teamIdStr = teamId.toString();
          const playerIdStr = playerId.toString();

          // Send request to server with full URL path
          const response = await axios.post(`${API_URL}/auction/remove`, {
            teamId: teamIdStr,
            playerId: playerIdStr,
          });

          if (response.data.success) {
            toast.success("Player removed successfully");
            return response.data;
          } else {
            throw new Error(response.data.message || "Failed to remove player");
          }
        } catch (error) {
          console.error("Error removing player:", error);
          // Rethrow for component handling
          throw error;
        }
      },

      // Get a team by ID
      getTeamById: (teamId) => {
        return get().teams.find((team) => team.id === teamId);
      },

      // Get a player by ID
      getPlayerById: (playerId) => {
        return get().players.find((player) => player.id === playerId);
      },

      // Get all available (unsold) players
      getAvailablePlayers: () => {
        return get().players.filter((player) => !player.sold);
      },

      // Calculate team stats
      calculateTeamStats: (teamId) => {
        const team = get().teams.find((t) => t.id === teamId);
        if (!team) return null;

        const players = team.players || [];
        const spent = players.reduce((total, player) => {
          return total + (player.bidAmount || player.price || 0);
        }, 0);

        const remaining = team.budget || 0;
        const total = spent + remaining;
        const percentUsed = total > 0 ? (spent / total) * 100 : 0;

        return {
          spent,
          remaining,
          total,
          percentUsed,
          playerCount: players.length,
        };
      },
    }),
    {
      name: "auction-storage",
      // Only persist teams and players
      partialize: (state) => ({ teams: state.teams, players: state.players }),
    }
  )
);
