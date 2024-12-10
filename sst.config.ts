/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "keyalert",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const infra = await import("./infra");

    return {
      api: infra.apiGateway.url,
    };
  },
});
