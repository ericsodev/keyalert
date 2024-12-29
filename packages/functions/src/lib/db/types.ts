import { ColumnType, Generated } from "kysely";

export interface Database {
  ingest_log: IngestLogTable;
}

export enum IngestSource {
  REDDIT = "Reddit",
  MANUAL = "Manual",
}

interface BaseTable {
  id: Generated<string>;
  createdAt: ColumnType<Date, never, never>;
  updatedAt: ColumnType<Date, never, string | undefined>;
  deletedAt: ColumnType<Date, string | undefined, string | undefined>;
}

export interface IngestLogTable extends BaseTable {
  label: string;
  source: IngestSource;
  externalId: string;
  timestamp: ColumnType<Date, string | undefined, string | undefined>;
}
