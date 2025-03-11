"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getDB;
exports.closeDB = closeDB;
exports.getDBSync = getDBSync;
const knex_1 = require("knex");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Use dynamic import for CommonJS compatibility
const getKnexConfig = async () => {
    try {
        const environment = process.env.NODE_ENV || "development";
        // Load config dynamically
        const knexfile = await Promise.resolve().then(() => __importStar(require("../../knexfile.cjs")));
        const config = knexfile.default[environment];
        // Ensure connection properties are set
        return Object.assign(Object.assign({}, config), { connection: {
                host: config.connection.host || process.env.DB_HOST || "localhost",
                user: config.connection.user || process.env.DB_USER || "root",
                password: config.connection.password || process.env.DB_PASSWORD || "",
                database: config.connection.database || process.env.DB_NAME || "auction_db",
                port: config.connection.port ||
                    (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306),
            } });
    }
    catch (error) {
        console.error("Error loading knexfile:", error);
        // Provide comprehensive fallback config
        return {
            client: "mysql2",
            connection: {
                host: process.env.DB_HOST || "localhost",
                user: process.env.DB_USER || "root",
                password: process.env.DB_PASSWORD || "",
                database: process.env.DB_NAME || "auction_db",
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            },
            // Add additional Knex configuration options
            pool: {
                min: 2,
                max: 10,
            },
            acquireConnectionTimeout: 10000,
        };
    }
};
// Initialize database connection
let db = null;
const initDB = async () => {
    const config = await getKnexConfig();
    return (0, knex_1.knex)(config);
};
// Export a function that ensures DB is initialized
async function getDB() {
    if (!db) {
        db = await initDB();
    }
    return db;
}
// Export a method to close the database connection
async function closeDB() {
    if (db) {
        await db.destroy();
        db = null;
    }
}
// Export a synchronous version for cases where async is not possible
async function getDBSync() {
    return getDB();
}
