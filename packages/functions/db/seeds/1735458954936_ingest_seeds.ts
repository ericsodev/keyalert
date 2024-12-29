import { Database, IngestSource, IngestTargetType, KeyboardSize } from "@lib/db/types";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
  await db.deleteFrom("keyboard_listing").execute();
  await db.deleteFrom("ingest_log").execute();
  await db.deleteFrom("ingest_batch").execute();

  const ingestBatch = await db
    .insertInto("ingest_batch")
    .values({
      startDate: new Date("2024-08-18").toISOString(),
      endDate: new Date("2024-08-19").toISOString(),
      source: IngestSource.MANUAL,
      timestamp: new Date().toISOString(),
      triggeredManually: true,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const ingestLogs = await db
    .insertInto("ingest_log")
    .values([
      {
        label: "Test ingest log",
        type: IngestTargetType.KEYBOARD,
        source: IngestSource.MANUAL,
        externalId: "1",
        timestamp: new Date().toISOString(),
        ingestBatchId: ingestBatch.id,
      },
      {
        label: "Test ingest log 2",
        type: IngestTargetType.KEYBOARD,
        source: IngestSource.MANUAL,
        externalId: "2",
        timestamp: new Date().toISOString(),
        ingestBatchId: ingestBatch.id,
      },
    ])
    .returningAll()
    .execute();

  await db
    .insertInto("keyboard_listing")
    .values([
      {
        ingestId: ingestLogs[0]?.id ?? "",
        designer: "Qwerty Keys",
        size: KeyboardSize.SIZE_65,
        description: "This is a keyboard",
        name: "Neo 65",
        timestamp: new Date("2023-04-01").toISOString(),
      },
      {
        ingestId: ingestLogs[1]?.id ?? "",
        designer: "Qwerty Keys",
        size: KeyboardSize.ALICE,
        description: "This is a ergo keyboard",
        name: "Neo Ergo",
        timestamp: new Date("2024-05-01").toISOString(),
      },
    ])
    .execute();
}
