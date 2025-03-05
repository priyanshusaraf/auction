import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("players", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.enum("category", ["A+", "A", "B", "C", "D"]).notNullable();
      table.integer("base_price").notNullable();
      table.boolean("is_sold").defaultTo(false);
      table.integer("team_id").unsigned().nullable(); // Temporarily allow NULL
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.alterTable("players", (table) => {
        table
          .foreign("team_id")
          .references("id")
          .inTable("teams")
          .onDelete("SET NULL");
      });
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("players");
}
