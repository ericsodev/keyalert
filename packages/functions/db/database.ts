import { Pool, PoolConfig } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { Database } from "./types";
import { LOCAL_TUNNEL_PORT } from "../scripts/tunnel";

const stage =
  process.env["NODE_ENV"] === "production" ? "production" : "staging";

const pgConfig: PoolConfig = {
  database: process.env["DB_NAME"] ?? "keyalert",
  host: "127.0.0.1",
  port: stage === "production" ? LOCAL_TUNNEL_PORT : 5432,
  user: process.env["DB_USER"] ?? "keyalert",
  password: process.env["DB_PASSWORD"] ?? "",
  max: 1,
  ssl:
    stage == "production"
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
