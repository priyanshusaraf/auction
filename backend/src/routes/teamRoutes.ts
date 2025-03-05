const express = require("express");

import { getAllTeams, addTeam } from "../controllers/teamController";

const router = express.Router();

router.get("/", getAllTeams);
router.post("/", addTeam);

export default router;
