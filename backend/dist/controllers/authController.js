"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = void 0;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// Mock admin credentials
const adminUser = {
    id: 1,
    username: "admin",
    password: bcrypt.hashSync("password", 10),
};
// Admin login function
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    if (username !== adminUser.username) {
        return res.status(401).json({ error: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ id: adminUser.id, role: "admin" }, JWT_SECRET, {
        expiresIn: "2h",
    });
    res.json({ token });
};
exports.loginAdmin = loginAdmin;
