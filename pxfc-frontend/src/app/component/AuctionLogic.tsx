"use client";

import { create } from "zustand";
import { AuctionStore, Player, Team } from "@/types";
import { playersData } from "@/data/players"; // ✅ Import from external file
import { teamsData } from "@/data/teams"; // ✅ Import from external file

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  players: [...playersData], // ✅ Load players from external file
  teams: [...teamsData], // ✅ Load teams from external file

  searchQuery: "",

  availablePlayers: () => get().players.filter((p) => p.available),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  addPlayerToTeam: (teamId: string, playerId: string, bidPrice: number) =>
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player || !player.available) return state;

      const team = state.teams.find((t) => t.id === teamId);
      if (!team || team.budget < bidPrice) return state;

      return {
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, available: false, price: bidPrice } : p
        ),
        teams: state.teams.map((t) =>
          t.id === teamId
            ? {
                ...t,
                players: [...t.players, { ...player, price: bidPrice }],
                budget: t.budget - bidPrice,
              }
            : t
        ),
      };
    }),

  removePlayerFromTeam: (teamId: string, playerId: string) =>
    set((state) => {
      const team = state.teams.find((t) => t.id === teamId);
      if (!team) return state;

      const player = team.players.find((p) => p.id === playerId);
      if (!player) return state;

      return {
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, available: true } : p
        ),
        teams: state.teams.map((t) =>
          t.id === teamId
            ? {
                ...t,
                players: t.players.filter((p) => p.id !== playerId),
                budget: t.budget + player.price,
              }
            : t
        ),
      };
    }),

  fetchPlayers: async () => {},
  fetchTeams: async () => {},
}));
