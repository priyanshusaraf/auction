import { Knex } from "knex";

// database/migrations/02_create_players_table.js
exports.up = function (knex: Knex) {
  return knex.schema.createTable("players", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("category").defaultTo("C");
    table.decimal("base_price", 12, 2).notNullable();
    table.boolean("is_sold").defaultTo(false);
    table
      .integer("team_id")
      .nullable()
      .references("id")
      .inTable("teams")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists("players");
};
