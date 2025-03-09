// controllers/auctionController.ts
import { Request, Response } from "express";
const db = require("../config/database");
import { emitAuctionUpdate } from "../config/socket";
import { Player } from "@/types";

// Place a bid in the auction
export const placeBid = async (req: Request, res: Response) => {
  // Start a transaction
  const trx = await db.transaction();

  try {
    const { player_id, team_id, price } = req.body;

    // Check if player is already sold
    const player = await trx("players").where({ id: player_id }).first();
    if (!player) {
      await trx.rollback();
      return res.status(404).json({ error: "Player not found" });
    }

    if (player.is_sold === 1) {
      await trx.rollback();
      return res.status(400).json({ error: "Player is already sold" });
    }

    // Check if team has enough budget
    const team = await trx("teams").where({ id: team_id }).first();
    if (!team) {
      await trx.rollback();
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.budget < price) {
      await trx.rollback();
      return res.status(400).json({ error: "Insufficient budget" });
    }

    // Deduct from team budget & mark player as sold
    await trx("teams")
      .where({ id: team_id })
      .update({
        budget: team.budget - price,
        updated_at: new Date(),
      });

    await trx("players").where({ id: player_id }).update({
      is_sold: 1,
      team_id,
      updated_at: new Date(),
    });

    // Insert auction record
    const auctionRecord = {
      player_id,
      team_id,
      price,
      final_price: price, // Set final price to be the same as initial price for now
      created_at: new Date(),
    };

    await trx("auction").insert(auctionRecord);

    // Commit the transaction
    await trx.commit();

    // Fetch updated team data for the response
    const updatedTeam = await db("teams").where({ id: team_id }).first();
    const teamPlayers = await db("players")
      .where({ team_id })
      .select("*")
      .then((players) => {
        return players.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.base_price,
          bidAmount: p.id === player_id ? price : undefined,
          sold: p.is_sold === 1,
          teamId: p.team_id,
        }));
      });

    // Format team data to match frontend expected structure
    const formattedTeam = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      budget: updatedTeam.budget,
      owner_id: updatedTeam.owner_id,
      players: teamPlayers,
    };

    // Format player data to match frontend expected structure
    const updatedPlayerData = {
      id: player.id,
      name: player.name,
      category: player.category,
      price: player.base_price,
      bidAmount: price,
      sold: true,
      teamId: team_id,
    };

    // Emit socket event for real-time updates
    emitAuctionUpdate("default", "BID_ACCEPTED", {
      teamData: formattedTeam,
      playerData: updatedPlayerData,
    });

    res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      team: formattedTeam,
      player: updatedPlayerData,
    });
  } catch (error: any) {
    // Rollback in case of error
    await trx.rollback();
    console.error("Error placing bid:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place bid",
      error: error.message,
    });
  }
};

// Get auction status (recent bids)
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
        "auction.final_price",
        "auction.created_at"
      )
      .orderBy("auction.created_at", "desc")
      .limit(10);

    res.json(auctionData);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch auction status",
      error: error.message,
    });
  }
};
