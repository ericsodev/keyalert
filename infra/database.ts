import { mainVpc } from "./network";

export const database = new sst.aws.Postgres("Database", {
  database: "keyalert",
  vpc: mainVpc,
  dev: {
    database: "keyalert",
    host: "localhost",
    port: 5432,
    username: "keyalert",
  },
});
