import { Request, Response } from "express";
import db from "../config/database";

// Get all players
export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await db("players").select("*");
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players" });
  }
};

// Add a new player
export const addPlayer = async (req: Request, res: Response) => {
  try {
    const { name, category, base_price, team_id } = req.body;
    const newPlayer = await db("players").insert({
      name,
      category,
      base_price,
      team_id: team_id || null,
    });
    res
      .status(201)
      .json({ message: "Player added successfully", playerId: newPlayer[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to add player" });
  }
};

// Search players by name, category, or team
export const searchPlayers = async (req: Request, res: Response) => {
  try {
    const { name, category, team_id } = req.query;

    let query = db("players").select("*");

    if (name) query = query.where("name", "like", `%${name}%`);
    if (category) query = query.where("category", category);
    if (team_id) query = query.where("team_id", team_id);

    const players = await query;
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to search players" });
  }
};

// Update a player's details
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { team_id, base_price } = req.body;

    const player = await db("players").where({ id }).first();
    if (!player) return res.status(404).json({ error: "Player not found" });

    await db("players").where({ id }).update({ team_id, base_price });

    res.json({ message: "Player updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update player" });
  }
};

// Delete an unsold player
export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const player = await db("players").where({ id }).first();
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (player.is_sold)
      return res.status(400).json({ error: "Cannot delete a sold player" });

    await db("players").where({ id }).del();

    res.json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete player" });
  }
};
