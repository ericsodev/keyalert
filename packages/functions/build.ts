import * as path from "path";
import { build } from "esbuild";
import { lambdas as internalLambdas } from "./src/functions/internal/lambdas";
type LambdaToBuild = {
  name: string;
  entry: string;
};
export async function bundleInternalLambdas(lambdas: LambdaToBuild[]) {
  for (const lambda of lambdas) {
    const outDir = path.resolve(__dirname, `build/${lambda.name}/bundle`);
    const outFile = path.join(outDir, "index.js");

    console.log("Building", lambda.name);

    await build({
      entryPoints: [
        path.resolve(__dirname, "./src/functions/internal/", lambda.entry),
      ],
      outfile: outFile,
      bundle: true,
      target: "node16",
      platform: "node",
      minify: true,
      sourcemap: true,
      external: ["aws-sdk"],
      logLevel: "error",
    });
  }
}

bundleInternalLambdas(internalLambdas);
