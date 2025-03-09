import express, { Request, Response } from "express";
import db from "../config/database";

const router = express.Router();

// Get all teams
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("GET /api/teams - Fetching all teams");

    // Fetch teams with their players
    const teams = await db("teams").select("*");

    // For each team, fetch its players
    const teamsWithPlayers = await Promise.all(
      teams.map(async (team) => {
        const players = await db("players")
          .where({ team_id: team.id })
          .select("*");

        // Get auction records for these players
        const playerIds = players.map((p) => p.id);
        let auctionRecords = [];

        if (playerIds.length > 0) {
          auctionRecords = await db("auction")
            .whereIn("player_id", playerIds)
            .where({ team_id: team.id })
            .select("*");
        }

        // Format players with bidAmount from auction records
        const formattedPlayers = players.map((player) => {
          // Find the auction record for this player
          const auction = auctionRecords.find((a) => a.player_id === player.id);

          return {
            id: player.id,
            name: player.name,
            category: player.category,
            price: parseFloat(player.base_price),
            bidAmount: auction ? parseFloat(auction.price) : undefined,
            sold: player.is_sold === 1,
            teamId: player.team_id,
          };
        });

        // Return formatted team with players and numeric budget
        return {
          id: team.id,
          name: team.name,
          budget: parseFloat(team.budget),
          initial_budget: parseFloat(team.initial_budget || team.budget),
          owner_id: team.owner_id,
          players: formattedPlayers,
        };
      })
    );

    console.log(`Returning ${teamsWithPlayers.length} teams with player data`);

    res.json(teamsWithPlayers);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
});

// Get a single team by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await db("teams").where({ id }).first();

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Get players for this team
    const players = await db("players").where({ team_id: id }).select("*");

    // Get auction records for these players
    const playerIds = players.map((p) => p.id);
    let auctionRecords = [];

    if (playerIds.length > 0) {
      auctionRecords = await db("auction")
        .whereIn("player_id", playerIds)
        .where({ team_id: id })
        .select("*");
    }

    // Format players with bidAmount from auction records
    const formattedPlayers = players.map((player) => {
      // Find the auction record for this player
      const auction = auctionRecords.find((a) => a.player_id === player.id);

      return {
        id: player.id,
        name: player.name,
        category: player.category,
        price: parseFloat(player.base_price),
        bidAmount: auction ? parseFloat(auction.price) : undefined,
        sold: player.is_sold === 1,
        teamId: player.team_id,
      };
    });

    // Format response with numeric budget and initial budget
    const formattedTeam = {
      id: team.id,
      name: team.name,
      budget: parseFloat(team.budget),
      initial_budget: parseFloat(team.initial_budget || team.budget),
      owner_id: team.owner_id,
      players: formattedPlayers,
    };

    res.json(formattedTeam);
  } catch (error) {
    console.error(`Error fetching team ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team",
      error: error.message,
    });
  }
});

// Add a new team
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, budget, owner_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Parse budget as number
    let parsedBudget = 650000; // Default budget
    if (budget !== undefined) {
      parsedBudget = parseFloat(budget);
      if (isNaN(parsedBudget)) {
        return res.status(400).json({
          success: false,
          message: "Budget must be a valid number",
        });
      }
    }

    const newTeam = {
      name,
      budget: parsedBudget,
      initial_budget: parsedBudget, // Store the initial budget
      owner_id: owner_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert and get the ID
    const [id] = await db("teams").insert(newTeam);

    // Format response
    const formattedTeam = {
      id,
      name: newTeam.name,
      budget: parseFloat(newTeam.budget),
      initial_budget: parseFloat(newTeam.initial_budget),
      owner_id: newTeam.owner_id,
      players: [],
    };

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: formattedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create team",
      error: error.message,
    });
  }
});

// Update a team
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, budget, owner_id } = req.body;

    const team = await db("teams").where({ id }).first();

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Parse budget as number if provided
    let parsedBudget = parseFloat(team.budget);
    if (budget !== undefined) {
      parsedBudget = parseFloat(budget);
      if (isNaN(parsedBudget)) {
        return res.status(400).json({
          success: false,
          message: "Budget must be a valid number",
        });
      }
    }

    const updatedTeam = {
      name: name || team.name,
      budget: parsedBudget,
      owner_id: owner_id !== undefined ? owner_id : team.owner_id,
      updated_at: new Date(),
    };

    await db("teams").where({ id }).update(updatedTeam);

    // Get updated players
    const players = await db("players").where({ team_id: id }).select("*");

    // Get auction records
    const playerIds = players.map((p) => p.id);
    let auctionRecords = [];

    if (playerIds.length > 0) {
      auctionRecords = await db("auction")
        .whereIn("player_id", playerIds)
        .where({ team_id: id })
        .select("*");
    }

    // Format players with bidAmount
    const formattedPlayers = players.map((player) => {
      const auction = auctionRecords.find((a) => a.player_id === player.id);

      return {
        id: player.id,
        name: player.name,
        category: player.category,
        price: parseFloat(player.base_price),
        bidAmount: auction ? parseFloat(auction.price) : undefined,
        sold: player.is_sold === 1,
        teamId: player.team_id,
      };
    });

    // Format response
    const formattedTeam = {
      id: parseInt(id, 10),
      name: updatedTeam.name,
      budget: parseFloat(updatedTeam.budget),
      initial_budget: parseFloat(team.initial_budget || team.budget),
      owner_id: updatedTeam.owner_id,
      players: formattedPlayers,
    };

    res.json({
      success: true,
      message: "Team updated successfully",
      team: formattedTeam,
    });
  } catch (error) {
    console.error(`Error updating team ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to update team",
      error: error.message,
    });
  }
});

// Delete a team
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const team = await db("teams").where({ id }).first();

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if team has any players
    const hasPlayers = await db("players").where({ team_id: id }).first();

    if (hasPlayers) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete team with assigned players. Remove all players first.",
      });
    }

    await db("teams").where({ id }).delete();

    res.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting team ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to delete team",
      error: error.message,
    });
  }
});

export default router;
