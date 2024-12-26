import { createMigrator } from "../db/migrator";
import { startTunnelling } from "./tunnel";

const stage =
  process.env["NODE_ENV"] === "production" ? "production" : "development";

async function migrateLatest() {
  const { db } = await import("../db/database");
  const migrator = createMigrator(db);
  const { error, results } = await migrator.migrateToLatest();
  await db.destroy();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(
        `🟢 Migration "${it.migrationName}" was executed successfully`,
      );
    } else if (it.status === "Error") {
      console.error(`Failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("❌ Failed to migrate");
    console.error(error);
    process.exit(1);
  }
  await db.destroy();
  console.log("🐥 Ran migrations");
}

async function main() {
  if (stage === "production") {
    await startTunnelling(migrateLatest);
  } else {
    await migrateLatest();
  }
}

main();
