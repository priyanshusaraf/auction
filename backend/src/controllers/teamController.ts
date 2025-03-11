import { Request, Response } from "express";
import { Knex } from "knex";
import getDB from "../config/database";

// Type definitions
interface Team {
  id?: number;
  name: string;
  budget?: number;
  owner_id?: number | null;
}

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const teams: Team[] = await db("teams").select("*");
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch teams",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Add a new team
export const addTeam = async (req: Request, res: Response) => {
  try {
    const { name, budget, owner_id } = req.body;
    const db = await getDB();

    // Validate team name
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Team name is required",
      });
    }

    // Parse budget with fallback
    const parsedBudget = budget ? parseFloat(budget) : 650000; // Default budget

    if (isNaN(parsedBudget)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget value",
      });
    }

    // Prepare team data
    const newTeam: Omit<Team, "id"> = {
      name,
      budget: parsedBudget,
      owner_id: owner_id || null,
    };

    // Insert team and get the ID
    const [id] = await db("teams").insert(newTeam);

    res.status(201).json({
      success: true,
      message: "Team added successfully",
      team: {
        id: Number(id),
        ...newTeam,
      },
    });
  } catch (error) {
    console.error("Error adding team:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add team",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
