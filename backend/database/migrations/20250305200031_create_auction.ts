import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("auction", (table) => {
    table.increments("id").primary();
    table
      .integer("player_id")
      .unsigned()
      .references("id")
      .inTable("players")
      .onDelete("CASCADE");
    table
      .integer("team_id")
      .unsigned()
      .references("id")
      .inTable("teams")
      .onDelete("CASCADE");
    table.integer("price").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("auction");
}
