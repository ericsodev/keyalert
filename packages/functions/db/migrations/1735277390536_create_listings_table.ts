import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ingest_log")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("updatedAt", "timestamptz", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", "timestamptz")
    .addColumn("label", "varchar(32)", (col) => col.notNull().defaultTo(""))
    .addColumn("type", "varchar(32)", (col) => col.notNull())
    .addColumn("source", "varchar(64)", (col) => col.notNull())
    .addColumn("externalId", "varchar(256)", (col) => col.notNull())
    .addColumn("timestamp", "timestamptz", (col) => col.notNull())
    .addUniqueConstraint("source_external_id_unique", ["source", "externalId", "deletedAt"])
    .execute();

  await db.schema
    .createTable("keyboard_listing")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", "timestamptz", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", "timestamptz")
    .addColumn("name", "varchar(64)", (col) => col.notNull())
    .addColumn("size", "varchar(64)", (col) => col.notNull())
    .addColumn("designer", "varchar(64)", (col) => col.notNull())
    .addColumn("timestamp", "timestamptz", (col) => col.notNull())
    .addColumn("ingestId", "uuid", (col) =>
      col.references("ingest_log.id").unique().notNull().onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("keyboard_listing").execute();
  await db.schema.dropTable("ingest_log").execute();
}
