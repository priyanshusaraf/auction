import express, { Request, Response } from "express";
import db from "../config/database";

const router = express.Router();

// Get all players
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("GET /api/players - Fetching all players");

    const players = await db("players")
      .select("*")
      .orderBy("category")
      .orderBy("name");

    console.log(`Found ${players.length} players`);

    // Map players to match the frontend expected format with numerical values
    const formattedPlayers = players.map((player) => ({
      id: player.id,
      name: player.name,
      category: player.category,
      price: parseFloat(player.base_price),
      sold: player.is_sold === 1,
      teamId: player.team_id,
    }));

    res.json(formattedPlayers);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch players",
      error: error.message,
    });
  }
});

// Get a single player by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await db("players").where({ id }).first();

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    // Format player to match frontend expected structure with numerical values
    const formattedPlayer = {
      id: player.id,
      name: player.name,
      category: player.category,
      price: parseFloat(player.base_price),
      sold: player.is_sold === 1,
      teamId: player.team_id,
    };

    res.json(formattedPlayer);
  } catch (error) {
    console.error(`Error fetching player ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch player",
      error: error.message,
    });
  }
});

// Create a new player
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required fields",
      });
    }

    // Validate category is one of the allowed enum values
    const validCategories = ["A+", "A", "B", "C", "D"];
    const playerCategory =
      category && validCategories.includes(category) ? category : "C";

    // Ensure price is a number
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    const newPlayer = {
      name,
      category: playerCategory,
      base_price: parsedPrice,
      is_sold: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert and get the ID
    const [id] = await db("players").insert(newPlayer);

    // Format response to match frontend expected structure
    const formattedPlayer = {
      id,
      name: newPlayer.name,
      category: newPlayer.category,
      price: parseFloat(newPlayer.base_price),
      sold: false,
      teamId: null,
    };

    res.status(201).json({
      success: true,
      message: "Player created successfully",
      player: formattedPlayer,
    });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create player",
      error: error.message,
    });
  }
});

// Update a player
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, price, sold, teamId } = req.body;

    const player = await db("players").where({ id }).first();

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    // Validate category
    const validCategories = ["A+", "A", "B", "C", "D"];
    let playerCategory = player.category;
    if (category && validCategories.includes(category)) {
      playerCategory = category;
    }

    // Parse price to ensure it's a number
    let parsedPrice = parseFloat(player.base_price);
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid number",
        });
      }
    }

    const updatedPlayer = {
      name: name || player.name,
      category: playerCategory,
      base_price: parsedPrice,
      is_sold: sold !== undefined ? (sold ? 1 : 0) : player.is_sold,
      team_id: teamId !== undefined ? teamId : player.team_id,
      updated_at: new Date(),
    };

    await db("players").where({ id }).update(updatedPlayer);

    // Format response to match frontend expected structure
    const formattedPlayer = {
      id: parseInt(id, 10),
      name: updatedPlayer.name,
      category: updatedPlayer.category,
      price: parseFloat(updatedPlayer.base_price),
      sold: updatedPlayer.is_sold === 1,
      teamId: updatedPlayer.team_id,
    };

    res.json({
      success: true,
      message: "Player updated successfully",
      player: formattedPlayer,
    });
  } catch (error) {
    console.error(`Error updating player ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to update player",
      error: error.message,
    });
  }
});

// Delete a player
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const player = await db("players").where({ id }).first();

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    await db("players").where({ id }).delete();

    res.json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting player ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to delete player",
      error: error.message,
    });
  }
});

export default router;
