import express, { Request, Response } from "express";
import db from "../config/database";
import { emitAuctionUpdate } from "../config/socket";

const router = express.Router();

// Place a bid
router.post("/bid", async (req: Request, res: Response) => {
  // Start a transaction
  const trx = await db.transaction();

  try {
    const { teamId, playerId, bidAmount, userId } = req.body;

    if (!teamId || !playerId || !bidAmount) {
      return res.status(400).json({
        success: false,
        message: "Team ID, player ID and bid amount are required",
      });
    }

    // Ensure bid is a number
    const bid = parseFloat(bidAmount);

    if (isNaN(bid) || bid <= 0) {
      return res.status(400).json({
        success: false,
        message: "Bid amount must be a positive number",
      });
    }

    // Get the team
    const team = await trx("teams").where({ id: teamId }).first();

    if (!team) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Ensure team budget is a number
    const teamBudget = parseFloat(team.budget);

    // Check if team has enough budget
    if (teamBudget < bid) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Bid exceeds team budget",
      });
    }

    // Get the player
    const player = await trx("players").where({ id: playerId }).first();

    if (!player) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    // Check if player is already sold
    if (player.is_sold === 1) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Player is already sold",
      });
    }

    // Ensure base price is a number
    const basePrice = parseFloat(player.base_price);

    // Check if bid meets minimum price
    if (bid < basePrice) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: `Bid must be at least ${basePrice}`,
      });
    }

    // Create a bid record in the auction table
    const auctionRecord = {
      player_id: playerId,
      team_id: teamId,
      price: bid,
      created_at: new Date(),
      final_price: bid, // Set final price for now
    };

    await trx("auction").insert(auctionRecord);

    // Update team budget - ensure numeric calculation
    const newBudget = teamBudget - bid;

    await trx("teams").where({ id: teamId }).update({
      budget: newBudget,
      updated_at: new Date(),
    });

    // Update player as sold to this team
    await trx("players").where({ id: playerId }).update({
      is_sold: 1,
      team_id: teamId,
      updated_at: new Date(),
    });

    // Commit the transaction
    await trx.commit();

    // Fetch updated team data for the response
    const updatedTeam = await db("teams").where({ id: teamId }).first();
    const teamPlayers = await db("players")
      .where({ team_id: teamId })
      .select("*");

    // Format team players with proper types
    const formattedTeamPlayers = teamPlayers.map((p) => {
      const isCurrentPlayer = p.id === parseInt(playerId, 10);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: parseFloat(p.base_price),
        bidAmount: isCurrentPlayer ? parseFloat(bid) : undefined,
        sold: p.is_sold === 1,
        teamId: p.team_id,
      };
    });

    // Format team data to match frontend expected structure with proper types
    const formattedTeam = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      budget: parseFloat(updatedTeam.budget),
      owner_id: updatedTeam.owner_id,
      players: formattedTeamPlayers,
    };

    // Format player data to match frontend expected structure
    const updatedPlayerData = {
      id: player.id,
      name: player.name,
      category: player.category,
      price: parseFloat(player.base_price),
      bidAmount: parseFloat(bid),
      sold: true,
      teamId: teamId,
    };

    console.log(
      "Emitting team with budget:",
      typeof formattedTeam.budget,
      formattedTeam.budget
    );
    console.log(
      "Player bid amount:",
      typeof updatedPlayerData.bidAmount,
      updatedPlayerData.bidAmount
    );

    // Emit socket event for real-time updates
    emitAuctionUpdate("BID_ACCEPTED", {
      teamData: formattedTeam,
      playerData: updatedPlayerData,
    });

    res.json({
      success: true,
      message: "Bid accepted successfully",
      team: formattedTeam,
    });
  } catch (error) {
    // Rollback in case of error
    await trx.rollback();

    console.error("Error placing bid:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place bid",
      error: error.message,
    });
  }
});

// Remove a player from a team (undo a bid)
router.post("/remove", async (req, res) => {
  // Start a transaction
  const trx = await db.transaction();

  try {
    const { teamId, playerId } = req.body;

    if (!teamId || !playerId) {
      return res.status(400).json({
        success: false,
        message: "Team ID and player ID are required",
      });
    }

    // Get the player
    const player = await trx("players")
      .where({
        id: playerId,
        team_id: teamId,
        is_sold: 1,
      })
      .first();

    if (!player) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Player not found or not owned by this team",
      });
    }

    // Get the team
    const team = await trx("teams").where({ id: teamId }).first();

    if (!team) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Get the bid amount from the auction table
    const auction = await trx("auction")
      .where({
        player_id: playerId,
        team_id: teamId,
      })
      .orderBy("created_at", "desc")
      .first();

    // Ensure bid amount is a number
    let bidAmount = parseFloat(player.base_price);

    if (auction) {
      bidAmount = parseFloat(auction.price);

      // Delete the auction record
      await trx("auction")
        .where({
          player_id: playerId,
          team_id: teamId,
        })
        .delete();
    }

    // Update player status
    await trx("players").where({ id: playerId }).update({
      is_sold: 0,
      team_id: null,
      updated_at: new Date(),
    });

    // Ensure team budget is a number
    const teamBudget = parseFloat(team.budget);

    // Return the bid amount to the team's budget
    const newBudget = teamBudget + bidAmount;

    await trx("teams").where({ id: teamId }).update({
      budget: newBudget,
      updated_at: new Date(),
    });

    // Commit the transaction
    await trx.commit();

    // Fetch updated team data
    const updatedTeam = await db("teams").where({ id: teamId }).first();
    const teamPlayers = await db("players")
      .where({ team_id: teamId })
      .select("*");

    // Format team players with proper types
    const formattedTeamPlayers = teamPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: parseFloat(p.base_price),
      sold: p.is_sold === 1,
      teamId: p.team_id,
    }));

    // Format team data to match frontend expected structure with proper types
    const formattedTeam = {
      id: updatedTeam.id,
      name: updatedTeam.name,
      budget: parseFloat(updatedTeam.budget),
      owner_id: updatedTeam.owner_id,
      players: formattedTeamPlayers,
    };

    // Format player data to match frontend expected structure
    const updatedPlayerData = {
      id: player.id,
      name: player.name,
      category: player.category,
      price: parseFloat(player.base_price),
      sold: false,
      teamId: null,
    };

    console.log(
      "Emitting team with budget:",
      typeof formattedTeam.budget,
      formattedTeam.budget
    );

    // Emit socket event for real-time updates
    emitAuctionUpdate("PLAYER_REMOVED", {
      teamData: formattedTeam,
      playerData: updatedPlayerData,
    });

    res.json({
      success: true,
      message: "Player removed successfully",
      team: formattedTeam,
    });
  } catch (error) {
    // Rollback in case of error
    await trx.rollback();

    console.error("Error removing player:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove player",
      error: error.message,
    });
  }
});

export default router;
