"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const authenticateAdmin = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token)
            return res
                .status(401)
                .json({ error: "Access denied. No token provided." });
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        req.body.adminId = decoded.id;
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};
exports.authenticateAdmin = authenticateAdmin;
