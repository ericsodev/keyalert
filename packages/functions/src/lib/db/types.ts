import { ColumnType, GeneratedAlways } from "kysely";

export interface Database {
  ingest_log: IngestLogTable;
  ingest_batch: IngestBatchTable;
  keyboard_listing: KeyboardListingTable;
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
  updatedAt: ColumnType<Date, never, string>;
  deletedAt: ColumnType<Date | null, never, string | null>;
}

export interface IngestBatchTable extends BaseTable {
  source: IngestSource;
  timestamp: ColumnType<Date, string, string>;
  triggeredManually: boolean;
  startDate: ColumnType<Date, string, undefined>;
  endDate: ColumnType<Date, string, undefined>;
}

export interface IngestLogTable extends BaseTable {
  label: string;
  type: IngestTargetType;
  source: IngestSource;
  externalId: string;
  timestamp: ColumnType<Date, string, string>;
  ingestBatchId: string;
}

export enum KeyboardSize {
  ALICE = "Alice",
  ARISU = "Arisu",
  SIZE_60 = "60%",
  SIZE_65 = "65%",
  SIZE_75 = "75%",
  SIZE_80 = "80%",
  ERGO = "Ergonomic",
  OTHER = "Other",
}

export interface KeyboardListingTable extends BaseTable {
  name: string;
  size: KeyboardSize;
  designer: string;
  timestamp: ColumnType<Date, string, string>;
  description: string | null;
  ingestId: string;
}
