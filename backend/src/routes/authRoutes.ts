const express = require("express");
import { loginAdmin } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginAdmin); // ✅ Ensure this line exists

export default router;
