import { mainVpc } from "./network";

export const rds = new sst.aws.Postgres("Database", {
  database: "keyalert",
  vpc: mainVpc,
  dev: {
    database: "keyalert",
    host: "localhost",
    port: 5432,
    username: "keyalert",
    password: "",
  },
});
