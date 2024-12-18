import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "./database";
import { promises as fs } from "fs";
import * as path from "path";

const provider = new FileMigrationProvider({
  fs,
  path,
  migrationFolder: path.join(__dirname, "some/path/to/migrations"),
});

export const migrator = new Migrator({ db, provider });
