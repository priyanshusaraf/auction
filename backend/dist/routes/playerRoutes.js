"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../config/database"));
const socket_1 = require("../config/socket");
// Wrap async route handlers to handle potential async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Create router with explicit typing
const router = express_1.default.Router();
// Place a bid
router.post("/bid", asyncHandler(async (req, res) => {
    // Get database connection
    const db = await (0, database_1.default)();
    // Start a transaction
    const trx = await db.transaction();
    try {
        const { player_id, team_id, price } = req.body;
        // Check if player is already sold
        const player = await trx("players")
            .where({ id: player_id })
            .first();
        if (!player) {
            await trx.rollback();
            return res.status(404).json({ error: "Player not found" });
        }
        if (player.is_sold === 1) {
            await trx.rollback();
            return res.status(400).json({ error: "Player is already sold" });
        }
        // Check if team has enough budget
        const team = await trx("teams")
            .where({ id: team_id })
            .first();
        if (!team) {
            await trx.rollback();
            return res.status(404).json({ error: "Team not found" });
        }
        if (team.budget < price) {
            await trx.rollback();
            return res.status(400).json({ error: "Insufficient budget" });
        }
        // Deduct from team budget & mark player as sold
        await trx("teams").where({ id: team_id }).update({
            budget: team.budget - price,
            updated_at: new Date(),
        });
        await trx("players")
            .where({ id: player_id })
            .update({
            is_sold: 1,
            team_id,
            updated_at: new Date(),
        });
        // Insert auction record
        const auctionRecord = {
            player_id,
            team_id,
            price,
            final_price: price,
            created_at: new Date(),
        };
        await trx("auction").insert(auctionRecord);
        // Commit the transaction
        await trx.commit();
        // Fetch updated team data for the response
        const updatedTeam = await db("teams")
            .where({ id: team_id })
            .first();
        const teamPlayers = await db("players")
            .where({ team_id })
            .select("*");
        // Format players with additional info
        const formattedPlayers = teamPlayers.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: parseFloat(p.base_price),
            bidAmount: p.id === player_id ? price : undefined,
            sold: p.is_sold === 1,
            teamId: p.team_id,
        }));
        // Format team data to match frontend expected structure
        const formattedTeam = {
            id: updatedTeam.id,
            name: updatedTeam.name,
            budget: updatedTeam.budget,
            owner_id: updatedTeam.owner_id,
            players: formattedPlayers,
        };
        // Format player data to match frontend expected structure
        const updatedPlayerData = {
            id: player.id,
            name: player.name,
            category: player.category,
            price: parseFloat(player.base_price),
            bidAmount: price,
            sold: true,
            teamId: team_id,
        };
        // Emit socket event for real-time updates
        (0, socket_1.emitAuctionUpdate)("BID_ACCEPTED", {
            teamData: formattedTeam,
            playerData: updatedPlayerData,
        });
        res.status(201).json({
            success: true,
            message: "Bid placed successfully",
            team: formattedTeam,
            player: updatedPlayerData,
        });
    }
    catch (error) {
        // Rollback in case of error
        await trx.rollback();
        console.error("Error placing bid:", error);
        res.status(500).json({
            success: false,
            message: "Failed to place bid",
            error: error.message,
        });
    }
}));
// Remove a player from a team (undo a bid)
router.post("/remove", asyncHandler(async (req, res) => {
    // Get database connection
    const db = await (0, database_1.default)();
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
        // Emit socket event for real-time updates
        (0, socket_1.emitAuctionUpdate)("PLAYER_REMOVED", {
            teamData: formattedTeam,
            playerData: updatedPlayerData,
        });
        res.json({
            success: true,
            message: "Player removed successfully",
            team: formattedTeam,
        });
    }
    catch (error) {
        await trx.rollback();
        console.error("Error removing bid:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove bid",
            error: error.message,
        });
    }
}));
exports.default = router;
