import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = process.env.PORT || "http://localhost:5000";
export const useAuctionStore = create(
  persist(
    (set, get) => ({
      teams: [],
      players: [],
      loading: false,
      error: null,

      // Initialize the store with data from the server
      fetchInitialData: async () => {
        set({ loading: true, error: null });
        try {
          // Load teams and players in parallel
          const [teamsResponse, playersResponse] = await Promise.all([
            axios.get(`${API_URL}/teams`),
            axios.get(`${API_URL}/players`),
          ]);

          set({
            teams: teamsResponse.data,
            players: playersResponse.data,
            loading: false,
          });
        } catch (error) {
          console.error("Error fetching initial data:", error);
          set({
            error: "Failed to load auction data. Please refresh the page.",
            loading: false,
          });
        }
      },

      // Update a team's data (used when receiving socket updates)
      updateTeamData: (updatedTeam) => {
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === updatedTeam.id ? updatedTeam : team
          ),
        }));
      },

      // Mark a player as sold
      markPlayerAsSold: (playerId, teamId) => {
        set((state) => ({
          players: state.players.map((player) =>
            player.id === playerId
              ? { ...player, sold: true, teamId: teamId }
              : player
          ),
        }));
      },

      // Add a player to a team (local operation)
      addPlayerToTeam: (teamId, playerId, bidAmount) => {
        const { teams, players } = get();

        // Find the player
        const player = players.find((p) => p.id === playerId);
        if (!player) return;

        // Find the team
        const team = teams.find((t) => t.id === teamId);
        if (!team) return;

        // Make a copy of the player with bidAmount added
        const playerWithBid = { ...player, bidAmount };

        // Create a new teams array with the updated team
        const updatedTeams = teams.map((t) => {
          if (t.id === teamId) {
            // Calculate new budget
            const newBudget = t.budget - bidAmount;
            // Add player to team
            return {
              ...t,
              budget: newBudget,
              players: [...t.players, playerWithBid],
            };
          }
          return t;
        });

        // Create a new players array with the updated player
        const updatedPlayers = players.map((p) =>
          p.id === playerId ? { ...p, sold: true, teamId } : p
        );

        // Update the state
        set({
          teams: updatedTeams,
          players: updatedPlayers,
        });
      },

      // Remove a player from a team (should rarely be used)
      removePlayerFromTeam: async (teamId, playerId) => {
        try {
          // In a real application, this would trigger a server request
          // to undo a bid, which might have special rules or be restricted
          console.warn(
            "Player removal functionality should be handled by server"
          );

          // For now, just update the local state
          set((state) => {
            // Find the team and player
            const team = state.teams.find((t) => t.id === teamId);
            const playerInTeam = team?.players.find((p) => p.id === playerId);

            if (!team || !playerInTeam) return state;

            // Return the bid amount to the team's budget
            const bidAmount = playerInTeam.bidAmount || playerInTeam.price;

            // Create updated teams array
            const updatedTeams = state.teams.map((t) => {
              if (t.id === teamId) {
                return {
                  ...t,
                  budget: t.budget + bidAmount,
                  players: t.players.filter((p) => p.id !== playerId),
                };
              }
              return t;
            });

            // Update the player's sold status
            const updatedPlayers = state.players.map((p) =>
              p.id === playerId ? { ...p, sold: false, teamId: null } : p
            );

            return {
              teams: updatedTeams,
              players: updatedPlayers,
            };
          });
        } catch (error) {
          console.error("Error removing player:", error);
        }
      },
    }),
    {
      name: "auction-storage",
      // Only persist teams and players
      partialize: (state) => ({ teams: state.teams, players: state.players }),
    }
  )
);
