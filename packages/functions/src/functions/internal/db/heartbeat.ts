import { dbConnect } from "@lib/db/database";
import { sql } from "kysely";
export const handler = async () => {
  const db = dbConnect();
  const snippet = sql<unknown>`SELECT NOW();`.compile(db);
  const query = await db.executeQuery(snippet);
  console.log(query);
  console.log("Database connected");
  await db.destroy();
};
