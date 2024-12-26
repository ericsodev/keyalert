import { Pool, PoolConfig } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "./types";

const stage =
  process.env["NODE_ENV"] === "production" ? "producution" : "staging";

const pgConfig: PoolConfig = {
  database: process.env["DB_NAME"] ?? "keyalert",
  host: "127.0.0.1",
  port: process.env["NODE_ENV"] === "production" ? 5391 : 5432,
  user: process.env["DB_USER"] ?? "keyalert",
  password: process.env["DB_PASSWORD"] ?? "",
  max: 1,
  ssl:
    stage === "producution"
      ? {
          rejectUnauthorized: false,
        }
      : false,
};

export const pgDialect = new PostgresDialect({
  pool: new Pool(pgConfig),
});

export const db = new Kysely<Database>({
  dialect: pgDialect,
  log: ["error"],
});
