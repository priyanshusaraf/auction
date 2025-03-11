import { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("players", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.enum("gender", ["male", "female"]).notNullable();
    table.string("category").notNullable();
    table.decimal("base_price", 12, 2).notNullable();
    table.boolean("is_sold").defaultTo(false);
    table.boolean("is_retained").defaultTo(false);
    table.decimal("bid_amount", 12, 2).nullable();
    table
      .integer("team_id")
      .unsigned() // Add this line to ensure compatibility with auto-increment primary key
      .nullable()
      .references("id")
      .inTable("teams")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTableIfExists("players");
}
