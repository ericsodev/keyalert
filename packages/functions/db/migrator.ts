import { FileMigrationProvider, Kysely, Migrator } from "kysely";
import { promises as fs } from "fs";
import * as path from "path";
import { Database } from "./types";

const provider = new FileMigrationProvider({
  fs,
  path,
  migrationFolder: path.join(__dirname, "./migrations/"),
});

export function createMigrator(db: Kysely<Database>) {
  return new Migrator({ db, provider });
}
