import { DummyDriver, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from "kysely";
import { defineConfig } from "kysely-ctl";

export default defineConfig({
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new DummyDriver();
    },
    createIntrospector(db) {
      return new PostgresIntrospector(db);
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler();
    },
  },
  migrations: {
    migrationFolder: "migrations",
  },
  //   plugins: [],
  seeds: {
    seedFolder: "seeds",
  },
});
