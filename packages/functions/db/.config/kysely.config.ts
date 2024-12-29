import { defineConfig } from "kysely-ctl";
import { DatabaseConnection } from "../../src/lib/db/database";
import { CamelCasePlugin } from "kysely";

const dbConfig = new DatabaseConnection("development");

// Config only used for kysely cli to create new migrations/seeds and run local seeds
export default defineConfig({
  dialect: dbConfig.dialect,
  plugins: [new CamelCasePlugin()],
  migrations: {
    migrationFolder: "migrations",
  },
  seeds: {
    seedFolder: "seeds",
  },
});
