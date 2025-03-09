import { Knex } from "knex";

// database/migrations/01_create_teams_table.js
exports.up = function (knex: Knex) {
  return knex.schema.createTable("teams", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.decimal("budget", 12, 2).defaultTo(650000);
    table.integer("owner_id").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTableIfExists("teams");
};
