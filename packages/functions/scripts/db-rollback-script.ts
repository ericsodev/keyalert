import { createMigrator } from "../db/migrator";
import { startTunnelling } from "./tunnel";

const stage =
  process.env["NODE_ENV"] === "production" ? "production" : "development";

async function rollbackMigration() {
  const { db } = await import("../db/database");
  const migrator = createMigrator(db);
  const { results, error } = await migrator.migrateDown();
  await db.destroy();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(
        `🟢 Migration "${it.migrationName}" was rolled back successfully`,
      );
    } else if (it.status === "Error") {
      console.error(`Failed to roll back migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("❌ Failed to rollback last migration");
    console.error(error);
    process.exit(1);
  }
  await db.destroy();
  console.log("🐥 Rolled back");
}

async function main() {
  if (stage === "production") {
    await startTunnelling(rollbackMigration);
  } else {
    await rollbackMigration();
  }
}

main();
