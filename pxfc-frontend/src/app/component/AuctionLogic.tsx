"use client";

import { create } from "zustand";
import { AuctionStore, Player, Team } from "@/types";

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  players: [
    {
      id: "1",
      name: "Player 1",
      category: "A+",
      price: 40000,
      available: true,
    },
    { id: "2", name: "Player 2", category: "B", price: 20000, available: true },
    { id: "3", name: "Player 3", category: "D", price: 5000, available: true },
  ] as Player[],

  teams: [
    { id: "team1", name: "Team A", budget: 650000, players: [] },
    { id: "team2", name: "Team B", budget: 650000, players: [] },
  ] as Team[],

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
