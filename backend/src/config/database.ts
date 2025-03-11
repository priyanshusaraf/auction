import { Knex, knex } from "knex";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define configuration interface with optional properties
interface DatabaseConfig extends Knex.Config {
  client: string;
  connection: {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
  };
}

// Use dynamic import for CommonJS compatibility
const getKnexConfig = async (): Promise<DatabaseConfig> => {
  try {
    const environment = process.env.NODE_ENV || "development";

    // Load config dynamically
    const knexfile = await import("../../knexfile.cjs");
    const config = knexfile.default[environment] as DatabaseConfig;

    // Ensure connection properties are set
    return {
      ...config,
      connection: {
        host: config.connection.host || process.env.DB_HOST || "localhost",
        user: config.connection.user || process.env.DB_USER || "root",
        password: config.connection.password || process.env.DB_PASSWORD || "",
        database:
          config.connection.database || process.env.DB_NAME || "auction_db",
        port:
          config.connection.port ||
          (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306),
      },
    };
  } catch (error) {
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
let db: Knex | null = null;

const initDB = async (): Promise<Knex> => {
  const config = await getKnexConfig();
  return knex(config);
};

// Export a function that ensures DB is initialized
export default async function getDB(): Promise<Knex> {
  if (!db) {
    db = await initDB();
  }
  return db;
}

// Export a method to close the database connection
export async function closeDB(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}

// Export a synchronous version for cases where async is not possible
export async function getDBSync(): Promise<Knex> {
  return getDB();
}
