const { spawnSync } = require("child_process");
const knex = require("knex");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Define Knex config
const knexConfig = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "auction_db",
  },
  migrations: {
    directory: path.join(__dirname, "database/migrations"),
  },
  seeds: {
    directory: path.join(__dirname, "database/seeds"),
  },
};

// Create a Knex instance
const db = knex(knexConfig);

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "migrate:latest":
        console.log("Running migrations...");
        await db.migrate.latest();
        console.log("Migrations completed successfully");
        break;
      case "migrate:rollback":
        console.log("Rolling back migrations...");
        await db.migrate.rollback();
        console.log("Rollback completed successfully");
        break;
      case "seed:run":
        console.log("Running seeds...");
        await db.seed.run();
        console.log("Seeds completed successfully");
        break;
      default:
        console.log(
          "Unknown command. Use: migrate:latest, migrate:rollback, or seed:run"
        );
        process.exit(1);
    }
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Execute the script
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

module.exports = db;
