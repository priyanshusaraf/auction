import { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("teams", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("owners").notNullable(); // Changed to text to store multiple owners
    table.decimal("budget", 12, 2).defaultTo(650000);
    table.string("logo_url").nullable();
    table.timestamps(true, true);
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTableIfExists("teams");
}
