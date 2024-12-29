import { Database, IngestLogTable } from "@lib/db/types";
import { Insertable, Kysely, Selectable, Transaction, Updateable } from "kysely";

export class IngestLogService {
  db: Kysely<Database>;
  constructor(db: Kysely<Database>) {
    this.db = db;
  }

  public async getAll(): Promise<Selectable<IngestLogTable>[]> {
    const result = await this.db.selectFrom("ingest_log").selectAll().execute();

    return result;
  }

  public async getById(id: string): Promise<Selectable<IngestLogTable> | undefined> {
    const result = await this.db
      .selectFrom("ingest_log")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return result;
  }

  public async getByFilter(
    filter: Partial<Selectable<IngestLogTable>>,
  ): Promise<Selectable<IngestLogTable>[]> {
    const result = this.db
      .selectFrom("ingest_log")
      .where((eb) => eb.and(filter))
      .selectAll()
      .execute();

    return result;
  }

  public async create(
    data: Insertable<IngestLogTable>,
    trx?: Transaction<Database>,
  ): Promise<Selectable<IngestLogTable>> {
    const db = trx ?? this.db;
    const query = await db
      .insertInto("ingest_log")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return query;
  }

  public async updateById(
    id: string,
    data: Updateable<IngestLogTable>,
    trx?: Transaction<Database>,
  ): Promise<Selectable<IngestLogTable> | undefined> {
    const db = trx ?? this.db;

    const result = await db
      .updateTable("ingest_log")
      .where("id", "=", id)
      .set(data)
      .returningAll()
      .execute();

    return result[0];
  }
}
