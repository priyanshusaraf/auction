// src/types/index.ts
export interface Player {
  id: number;
  name: string;
  category: string;
  base_price: number;
  is_sold: number;
  team_id: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface Team {
  id: number;
  name: string;
  budget: number;
  owner_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuctionRecord {
  id?: number;
  player_id: number;
  team_id: number;
  price: number;
  final_price: number;
  created_at?: Date;
}

// Frontend types
export interface FrontendPlayer {
  id: number;
  name: string;
  category: string;
  price: number;
  bidAmount?: number;
  sold: boolean;
  teamId: number | null;
}

export interface FrontendTeam {
  id: number;
  name: string;
  budget: number;
  owner_id?: number;
  players: FrontendPlayer[];
}
