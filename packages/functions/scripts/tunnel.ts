import * as fs from "fs";
import * as path from "path";
import * as tunnelConfig from "./tunnel.config.json";
import { Client as SSHClient, type ConnectConfig as SshOptions } from "ssh2";
import { createServer } from "net";

export const LOCAL_TUNNEL_PORT = 5391;

/**
 * Tunnel to RDS through bastion host
 * @param cb Callback after tunnel to RDS is created
 */
export async function startTunnelling(cb: () => Promise<unknown>) {
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

  let ready = false;

  // Proxy to reroute connections to local port through tunnel
  let localProxy = createServer(function (sock: any) {
    if (!ready) return sock.destroy();
    sshClient.forwardOut(
      sock.remoteAddress,
      sock.remotePort,
      process.env["DB_HOST"] ?? "",
      5432,
      function (err: any, stream: any) {
        if (err) return sock.destroy();
        sock.pipe(stream);
        stream.pipe(sock);
      },
    );
  });
  localProxy.listen(LOCAL_TUNNEL_PORT, "127.0.0.1");

  // Connect to bastion host
  let sshClient = new SSHClient();
  sshClient.connect(sshConfig);
  sshClient.on("connect", function () {
    console.log("Connected to bastion host");
  });

  sshClient
    .on("ready", async function () {
      ready = true;
      await cb();

      // Cleanup
      sshClient.end();
      localProxy.close();
    })
    .on("close", () => {
      console.log("SSH Connection closed");
    });

  console.log("🛜 Successfully tunnelled to bastion host");
}
