import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  const table = db.schema.createTable("test");
  table.addColumn("username", "varchar");
  table.addColumn("password", "char(64)");

  await table.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("test").execute();
}
