import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    req.body.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};
