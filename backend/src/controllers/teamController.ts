import { Request, Response } from "express";
import db from "../config/database";

// Get all teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await db("teams").select("*");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// Add a new team
export const addTeam = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newTeam = await db("teams").insert({ name });
    res
      .status(201)
      .json({ message: "Team added successfully", teamId: newTeam[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to add team" });
  }
};
