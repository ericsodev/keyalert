import { Pool, PoolConfig } from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Database } from "./types";
import { z } from "zod";

type Stage = "production" | "development" | "local-prod";

const prodEnvSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.number({ coerce: true }),
  DB_USER: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
});

export class DatabaseConnection {
  private stage!: Stage;
  private database?: Kysely<Database>;
  constructor(stage?: Stage) {
    if (stage) {
      this.stage = stage;
    } else {
      this.stage = process.env["NODE_ENV"] === "production" ? "production" : "development";
    }
  }

  get db(): Kysely<Database> {
    if (!this.database) {
      this.database = new Kysely<Database>({
        dialect: this.dialect,
        log: ["error"],
        plugins: [new CamelCasePlugin()],
      });
    }
    return this.database;
  }

  get dialect(): PostgresDialect {
    return new PostgresDialect({
      pool: new Pool(this.config),
    });
  }

  get config(): PoolConfig {
    let env;
    switch (this.stage) {
      case "development":
        return {
          database: "keyalert",
          host: "127.0.0.1",
          port: 5432,
          user: "keyalert",
          max: 1,
        };
      case "local-prod":
        env = prodEnvSchema.parse(process.env);
        return {
          database: env.DB_NAME,
          host: "127.0.0.1",
          port: 5391,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          max: 1,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      case "production":
        env = prodEnvSchema.parse(process.env);
        return {
          database: env.DB_NAME,
          host: env.DB_HOST,
          port: env.DB_PORT,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          max: 1,
          ssl: {
            rejectUnauthorized: false,
          },
        };
    }
  }
}

export function dbConnect(stage?: Stage): Kysely<Database> {
  return new DatabaseConnection(stage)?.db;
}
