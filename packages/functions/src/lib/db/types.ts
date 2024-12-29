import { ColumnType, GeneratedAlways } from "kysely";

export interface Database {
  ingest_log: IngestLogTable;
  ingest_batch: IngestBatchTable;
}

export enum IngestSource {
  REDDIT = "Reddit",
  MANUAL = "Manual",
}

export enum IngestTargetType {
  KEYBOARD = "Keyboard",
}

interface BaseTable {
  id: GeneratedAlways<string>;
  createdAt: ColumnType<Date, never, never>;
  updatedAt: ColumnType<Date, never, string | undefined>;
  deletedAt: ColumnType<Date, never, string | undefined>;
}

export interface IngestBatchTable extends BaseTable {
  source: IngestSource;
  timestamp: ColumnType<Date, string | undefined, string | undefined>;
  triggeredManually: boolean;
  startDate: ColumnType<Date, string, undefined>;
  endDate: ColumnType<Date, string, undefined>;
}

export interface IngestLogTable extends BaseTable {
  label: string;
  type: IngestTargetType;
  source: IngestSource;
  externalId: string;
  timestamp: ColumnType<Date, string | undefined, string | undefined>;
}
