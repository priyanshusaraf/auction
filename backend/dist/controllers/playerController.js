"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.updatePlayer = exports.searchPlayers = exports.addPlayer = exports.getAllPlayers = void 0;
const db = require("../config/database");
// Get all players
const getAllPlayers = async (req, res) => {
    try {
        console.log("GET /api/players - Fetching all players");
        const players = await db("players")
            .select("*")
            .orderBy("category")
            .orderBy("name");
        console.log(`Found ${players.length} players`);
        // Map players to match the frontend expected format
        const formattedPlayers = players.map((player) => ({
            id: player.id,
            name: player.name,
            category: player.category,
            price: player.base_price,
            sold: player.is_sold === 1,
            teamId: player.team_id,
        }));
        res.json(formattedPlayers);
    }
    catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch players",
            error: error.message,
        });
    }
};
exports.getAllPlayers = getAllPlayers;
// Add a new player
const addPlayer = async (req, res) => {
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
        const playerCategory = category && validCategories.includes(category) ? category : "C";
        const newPlayer = {
            name,
            category: playerCategory,
            base_price: parseInt(price, 10),
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
            price: newPlayer.base_price,
            sold: false,
            teamId: null,
        };
        res.status(201).json({
            success: true,
            message: "Player created successfully",
            player: formattedPlayer,
        });
    }
    catch (error) {
        console.error("Error creating player:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create player",
            error: error.message,
        });
    }
};
exports.addPlayer = addPlayer;
// Search players by name, category, or team
const searchPlayers = async (req, res) => {
    try {
        const { name, category, team_id } = req.query;
        let query = db("players").select("*");
        if (name)
            query = query.where("name", "like", `%${name}%`);
        if (category)
            query = query.where("category", category);
        if (team_id)
            query = query.where("team_id", team_id);
        const players = await query;
        res.json(players);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to search players" });
    }
};
exports.searchPlayers = searchPlayers;
// Update a player's details
const updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const { team_id, base_price } = req.body;
        const player = await db("players").where({ id }).first();
        if (!player)
            return res.status(404).json({ error: "Player not found" });
        await db("players").where({ id }).update({ team_id, base_price });
        res.json({ message: "Player updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update player" });
    }
};
exports.updatePlayer = updatePlayer;
// Delete an unsold player
const deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const player = await db("players").where({ id }).first();
        if (!player)
            return res.status(404).json({ error: "Player not found" });
        if (player.is_sold)
            return res.status(400).json({ error: "Cannot delete a sold player" });
        await db("players").where({ id }).del();
        res.json({ message: "Player deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete player" });
    }
};
exports.deletePlayer = deletePlayer;
