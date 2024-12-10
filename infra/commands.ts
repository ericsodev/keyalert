import { Resource } from "sst";
import { rds } from "./database";

export const migrateUpCommand = new sst.x.DevCommand("MigrateUp", {
  link: [rds],
  environment: {
    DB_HOST: Resource.Database.host,
    DB_PORT: Resource.Database.port.toString(),
    DB_USER: Resource.Database.username,
    DB_PASSWORD: Resource.Database.password,
  },
  dev: {
    autostart: false,
    command: "kysely migrate:latest",
  },
});
