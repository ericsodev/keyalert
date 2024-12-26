import { createMigrator } from "../db/migrator";
import { startTunnelling } from "./tunnel";

const stage =
  process.env["NODE_ENV"] === "production" ? "production" : "development";

async function main() {
  let tunnel;
  if (stage === "production") {
    tunnel = await startTunnelling();
  }

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
    console.error("❌ Failed to migrate");
    console.error(error);
    process.exit(1);
  }
  await db.destroy();
  console.log("🐥 Ran migrations");

  tunnel?.[0].close();
}

main();
