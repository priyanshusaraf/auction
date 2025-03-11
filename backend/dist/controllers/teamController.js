"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTeam = exports.getAllTeams = void 0;
const database_1 = __importDefault(require("../config/database"));
// Get all teams
const getAllTeams = async (req, res) => {
    try {
        const db = await (0, database_1.default)();
        const teams = await db("teams").select("*");
        res.json(teams);
    }
    catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch teams",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getAllTeams = getAllTeams;
// Add a new team
const addTeam = async (req, res) => {
    try {
        const { name, budget, owner_id } = req.body;
        const db = await (0, database_1.default)();
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
        const newTeam = {
            name,
            budget: parsedBudget,
            owner_id: owner_id || null,
        };
        // Insert team and get the ID
        const [id] = await db("teams").insert(newTeam);
        res.status(201).json({
            success: true,
            message: "Team added successfully",
            team: Object.assign({ id: Number(id) }, newTeam),
        });
    }
    catch (error) {
        console.error("Error adding team:", error);
        res.status(500).json({
            success: false,
            error: "Failed to add team",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.addTeam = addTeam;
