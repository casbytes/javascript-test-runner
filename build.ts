import * as esbuild from "esbuild";
import path from "node:path";
import fsExtra from "fs-extra";
import { glob } from "glob";

const pkgPath = path.join(process.cwd(), "package.json");
const pkg = fsExtra.readJsonSync(pkgPath);

console.log();
console.log("building...");

const entryPoints = glob.sync("src/**/*.ts", { ignore: ["src/**/*.d.ts"] });

await esbuild
  .build({
    entryPoints,
    // minify: true,
    bundle: true,
    target: [`node${pkg.engines.node}`],
    platform: "node",
    format: "cjs",
    sourcemap: true,
    outdir: "build",
    logLevel: "info",
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
