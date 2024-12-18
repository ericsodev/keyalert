import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "./types";

const pgConfig = {
  database: process.env["DB_NAME"] ?? "keyalert",
  host: process.env["DB_HOST"] ?? "localhost",
  port:
    process.env["DB_PORT"] !== undefined
      ? Number(process.env["DB_PORT"])
      : 5432,
  user: process.env["DB_USER"] ?? "keyalert",
  password: process.env["DB_USER"] ?? "",
  max: 1,
};

export const pgDialect = new PostgresDialect({
  pool: new Pool(pgConfig),
});

export const db = new Kysely<Database>({ dialect: pgDialect });
