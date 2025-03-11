import { Knex } from "knex";

// database/migrations/03_create_auction_table.js
export function up(knex: Knex) {
  return knex.schema.createTable("auction", (table) => {
    table.increments("id").primary();
    table
      .integer("player_id")
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");
    table
      .integer("team_id")
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");
    table.decimal("price", 12, 2).notNullable();
    table.decimal("final_price", 12, 2).nullable();
    table.timestamps(true, true);
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTableIfExists("auction");
}
