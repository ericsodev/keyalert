import * as fs from "fs";
import * as path from "path";
import * as tunnelConfig from "./tunnel.config.json";
import { createTunnel, SshOptions } from "tunnel-ssh";

export async function startTunnelling() {
  if (process.env["NODE_ENV"] !== "production") {
    // Can't tunnel outside prod env
    return;
  }
  const bastionIP = tunnelConfig.host;
  const bastionUser = tunnelConfig.user;

  if (!bastionIP) throw new Error("Missing bastion host IP variable");
  if (!bastionUser) throw new Error("Missing bastion host user variable");

  const sshConfig: SshOptions = {
    username: bastionUser,
    host: bastionIP,
    privateKey: fs.readFileSync(path.join(__dirname, "../bastion-ssh-key.pem")),
    port: 22,
    debug: undefined,
  };

  const tunnel = await createTunnel(
    { autoClose: true, reconnectOnError: false },
    {},
    { ...sshConfig },
    {
      dstPort: 5432,
      dstAddr: process.env["DB_HOST"] ?? "",

      // Local port to connect to prod db
      srcPort: 5391,
      srcAddr: "127.0.0.1",
    },
  );

  const client = tunnel[1];

  console.log("🛜 Successfully tunnelled to bastion host");
  return tunnel;
}
