import * as path from "path";

export const lambdas = [{ name: "db-heartbeat", entry: path.join(__dirname, "db/heartbeat.ts") }];
