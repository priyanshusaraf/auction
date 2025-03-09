const express = require("express");
const { loginAdmin } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginAdmin); // ✅ This line is correct

export default router;
