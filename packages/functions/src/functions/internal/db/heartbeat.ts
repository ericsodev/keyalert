import { dbConnect } from "@lib/db/database";
export const handler = async () => {
  const db = dbConnect();
  const tables = await db.introspection.getTables();
  console.log(tables);
};
