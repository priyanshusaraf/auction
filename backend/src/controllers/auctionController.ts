import { Request, Response } from "express";
import db from "../config/database";
import { emitAuctionUpdate } from "../config/socket";

// Place a bid in the auction
export const placeBid = async (req: Request, res: Response) => {
  try {
    const { player_id, team_id, price, final_price } = req.body; // ✅ Accept final_price

    // Check if player is already sold
    const player = await db("players").where({ id: player_id }).first();
    if (!player) return res.status(404).json({ error: "Player not found" });
    if (player.is_sold)
      return res.status(400).json({ error: "Player is already sold" });

    // Check if team has enough budget
    const team = await db("teams").where({ id: team_id }).first();
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.budget < price)
      return res.status(400).json({ error: "Insufficient budget" });

    // Deduct from team budget & mark player as sold
    await db("teams")
      .where({ id: team_id })
      .update({ budget: team.budget - price });
    await db("players")
      .where({ id: player_id })
      .update({ is_sold: true, team_id });

    // Insert auction record with final price
    await db("auction").insert({ player_id, team_id, price, final_price });

    res.status(201).json({ message: "Bid placed successfully", final_price });
  } catch (error) {
    res.status(500).json({ error: "Failed to place bid" });
  }
};

export const getAuctionStatus = async (_req: Request, res: Response) => {
  try {
    const auctionData = await db("auction")
      .join("players", "auction.player_id", "players.id")
      .join("teams", "auction.team_id", "teams.id")
      .select(
        "auction.id",
        "players.name as player",
        "teams.name as team",
        "auction.price",
        "auction.final_price" // ✅ Now included
      );
    res.json(auctionData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auction status" });
  }
};
