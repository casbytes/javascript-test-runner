import "dotenv/config";
import invariant from "tiny-invariant";
import path from "node:path";
import { exec as execSync } from "node:child_process";
import util from "node:util";
import fsExtra from "fs-extra";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { exec } from "./utils/exec";
import { git } from "./utils/simple-git";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

// const exec = util.promisify(execSync);

app.post("/check/:repo", async (c) => {
  const repo = c.req.param("repo");
  const username = c.req.query("username");

  const githubRepo = `${username}/${repo}`;
  const githubRepoUrl = `https://github.com/${githubRepo}`;
  const repoLocalPath = path.join(
    process.cwd(),
    "testspace",
    `${username}-${repo}`
  );
  const testSpace = path.join(process.cwd(), "testspace");
  const eslintConfig = path.join(testSpace, "eslint.config.js");
  const vitestConfig = path.join(testSpace, "vitest.config.js");
  const eslintResultsFile = path.join(repoLocalPath, "eslint-results.json");
  const testResultsFile = path.join(repoLocalPath, "test-results.json");

  try {
    invariant(repo, "repo is required");
    invariant(username, "username is required");
    if (!fsExtra.existsSync(repoLocalPath)) {
      fsExtra.mkdirSync(repoLocalPath, { recursive: true });
    }

    await git.cwd(repoLocalPath);
    await git.clone(githubRepoUrl, repoLocalPath);

    // const eslintExt = ["js", "mjs", "cjs"];
    // const vitestExt = ["js", "mjs", "cjs", "ts"];

    // const eslintConfigFilenames = eslintExt.map(
    //   (ext) => `eslint.config.${ext}`
    // );
    // const vitestConfigFilenames = vitestExt.map(
    //   (ext) => `vitest.config.${ext}`
    // );
    // const viteConfigFilenames = vitestExt.map((ext) => `vite.config.${ext}`);

    // const allVitestConfigFilenames = [
    //   ...vitestConfigFilenames,
    //   ...viteConfigFilenames,
    // ];

    // function copyFileToDest(filename: string) {
    //   fsExtra.copyFileSync(
    //     path.join(testSpace, filename),
    //     path.join(repoLocalPath, filename)
    //   );
    // }

    // function overrideConfigFiles(configFilenames: string[]) {
    //   for (const originalFilename of configFilenames) {
    //     const jsFilename = originalFilename.replace(
    //       /\.(js|ts|mjs|cjs)$/,
    //       ".js"
    //     );
    //     const jsConfigPath = path.join(testSpace, jsFilename);
    //     const configPath = path.join(repoLocalPath, originalFilename);
    //     if (fsExtra.existsSync(configPath)) {
    //       fsExtra.removeSync(configPath);
    //     }
    //     if (fsExtra.existsSync(jsConfigPath)) {
    //       copyFileToDest(jsFilename);
    //     }
    //   }
    // }

    // overrideConfigFiles(eslintConfigFilenames);
    // overrideConfigFiles(allVitestConfigFilenames);
    // copyFileToDest("setupTests.js");

    const eslintCommand = `npx eslint . --config=${eslintConfig} -f json -o ${eslintResultsFile}`;
    const vitestCommand = `npx vitest run --config=${vitestConfig} --reporter=json --outputFile=${testResultsFile}`;

    await exec("npm install", { cwd: repoLocalPath });
    await exec(eslintCommand, { cwd: testSpace });
    await exec(vitestCommand, { cwd: testSpace });

    const lintResults = await fsExtra.readJson(eslintResultsFile);
    const testResults = await fsExtra.readJson(testResultsFile);
    await fsExtra.remove(repoLocalPath);
    return c.json({ lintResults, testResults });
  } catch (error) {
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  } finally {
    try {
      if (fsExtra.existsSync(repoLocalPath)) {
        await fsExtra.remove(repoLocalPath);
      }
    } catch (cleanupError) {
      throw new HTTPException(500, {
        message:
          cleanupError instanceof Error
            ? cleanupError.message
            : "Internal Server Error",
      });
    }
  }
});

const port = Number(process.env.PORT) ?? 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
