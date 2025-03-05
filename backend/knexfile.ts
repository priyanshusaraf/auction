import type { Knex } from "knex";
const dotenv = require("dotenv").config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "auction_admin",
      password: process.env.DB_PASSWORD || "hi",
      database: process.env.DB_NAME || "pxfc_auction",
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: "./database/migrations" },
    seeds: { directory: "./database/seeds" },
  },

  staging: {
    client: "mysql2",
    connection: {
      host: process.env.STAGING_DB_HOST,
      port: Number(process.env.STAGING_DB_PORT) || 3306,
      user: process.env.STAGING_DB_USER,
      password: process.env.STAGING_DB_PASSWORD,
      database: process.env.STAGING_DB_NAME,
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: "./database/migrations" },
    seeds: { directory: "./database/seeds" },
  },

  production: {
    client: "mysql2",
    connection: {
      host: process.env.PROD_DB_HOST,
      port: Number(process.env.PROD_DB_PORT) || 3306,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
    },
    pool: { min: 2, max: 15 },
    migrations: { directory: "./database/migrations" },
    seeds: { directory: "./database/seeds" },
  },
};

export default config;
