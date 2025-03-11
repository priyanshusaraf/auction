"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../config/database"));
// Wrap async route handlers to handle potential async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Utility function to format team with players
const formatTeamWithPlayers = async (team) => {
    const db = await (0, database_1.default)();
    // Get players for this team
    const players = await db("players")
        .where({ team_id: team.id })
        .select("*");
    // Get auction records for these players
    const playerIds = players
        .map((p) => p.id)
        .filter((id) => id !== undefined);
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
    return {
        id: team.id,
        name: team.name,
        budget: parseFloat(team.budget.toString()),
        initial_budget: parseFloat((team.initial_budget || team.budget).toString()),
        owner_id: team.owner_id,
        players: formattedPlayers,
    };
};
// Create router with explicit typing
const router = express_1.default.Router();
// Get all teams
router.get("/", asyncHandler(async (req, res) => {
    console.log("GET /api/teams - Fetching all teams");
    const db = await (0, database_1.default)();
    // Explicitly type the database call
    const teams = await db("teams").select("*");
    // For each team, fetch its players and auction records
    const teamsWithPlayers = await Promise.all(teams.map(formatTeamWithPlayers));
    console.log(`Returning ${teamsWithPlayers.length} teams with player data`);
    res.json(teamsWithPlayers);
}));
// Get a single team by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await (0, database_1.default)();
    const team = await db("teams")
        .where({ id })
        .first();
    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found",
        });
    }
    // Format team with players and auction records
    const formattedTeam = await formatTeamWithPlayers(team);
    res.json(formattedTeam);
}));
// Add a new team
router.post("/", asyncHandler(async (req, res) => {
    const { name, budget, owner_id } = req.body;
    const db = await (0, database_1.default)();
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
        id: Number(id),
        name: newTeam.name,
        budget: newTeam.budget,
        initial_budget: newTeam.initial_budget,
        owner_id: newTeam.owner_id,
        players: [],
    };
    res.status(201).json({
        success: true,
        message: "Team created successfully",
        team: formattedTeam,
    });
}));
// Update a team
router.put("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, budget, owner_id } = req.body;
    const db = await (0, database_1.default)();
    const team = await db("teams")
        .where({ id })
        .first();
    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found",
        });
    }
    // Parse budget as number if provided
    let parsedBudget = parseFloat(team.budget.toString());
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
    // Re-fetch the updated team to ensure we have the latest data
    const refreshedTeam = await db("teams")
        .where({ id })
        .first();
    if (!refreshedTeam) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve updated team",
        });
    }
    // Format team with players
    const formattedTeam = await formatTeamWithPlayers(refreshedTeam);
    res.json({
        success: true,
        message: "Team updated successfully",
        team: formattedTeam,
    });
}));
// Delete a team
router.delete("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const db = await (0, database_1.default)();
    const team = await db("teams")
        .where({ id })
        .first();
    if (!team) {
        return res.status(404).json({
            success: false,
            message: "Team not found",
        });
    }
    // Check if team has any players
    const hasPlayers = await db("players")
        .where({ team_id: id })
        .first();
    if (hasPlayers) {
        return res.status(400).json({
            success: false,
            message: "Cannot delete team with assigned players. Remove all players first.",
        });
    }
    await db("teams").where({ id }).delete();
    res.json({
        success: true,
        message: "Team deleted successfully",
    });
}));
exports.default = router;
