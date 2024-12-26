import { dbConnect } from "../db/database";
import { createMigrator } from "../db/migrator";
import { startTunnelling } from "./tunnel";

const stage =
  process.env["NODE_ENV"] === "production" ? "production" : "development";

async function migrateLatest() {
  const db = dbConnect(stage === "production" ? "local-prod" : "development");
  const migrator = createMigrator(db);
  const { error, results } = await migrator.migrateToLatest();
  db.destroy();

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
