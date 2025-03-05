const express = require("express");
import {
  getAllPlayers,
  addPlayer,
  searchPlayers,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllPlayers);
router.post("/", authenticateAdmin, addPlayer); // Admin-only
router.get("/search", searchPlayers);
router.put("/:id", authenticateAdmin, updatePlayer); // Admin-only
router.delete("/:id", authenticateAdmin, deletePlayer); // Admin-only

export default router;
