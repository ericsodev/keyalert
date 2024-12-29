import { DatabaseConnection } from "@lib/db/database";
import { IngestLogService } from "./ingest-log-service";

const databaseConfig = new DatabaseConnection();

export const ds = {
  ingestLogService: new IngestLogService(databaseConfig.db),
};
