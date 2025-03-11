"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { loginAdmin } = require("../controllers/authController");
const router = express.Router();
router.post("/login", loginAdmin); // ✅ This line is correct
exports.default = router;
