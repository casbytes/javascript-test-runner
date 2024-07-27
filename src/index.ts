import "dotenv/config";
import invariant from "tiny-invariant";
import path from "node:path";
import fsExtra from "fs-extra";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { exec } from "./utils/exec";
import { git } from "./utils/simple-git";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

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
  const eslintConfig = path.join(testSpace, "eslint.config.mjs");
  const vitestConfig = path.join(testSpace, "vitest.config.js");
  const eslintResultsPath = path.join(repoLocalPath, "eslint-results.json");
  const testResultsPath = path.join(repoLocalPath, "test-results.json");

  try {
    invariant(repo, "repo is required");
    invariant(username, "username is required");
    if (!fsExtra.existsSync(repoLocalPath)) {
      fsExtra.mkdirSync(repoLocalPath, { recursive: true });
    }

    await git.cwd(repoLocalPath);
    await git.clone(githubRepoUrl, repoLocalPath);

    // await exec("npm install", { cwd: repoLocalPath });

    /**
     * Run eslint
     */
    // await exec(
    //   `npx eslint . --config=${eslintConfig} -f json -o ${eslintResultsPath}`,
    //   {
    //     cwd: testSpace,
    //   }
    // );

    /**
     * Run tests using vitest
     */
    await exec(
      `vitest run --reporter=json --config=${vitestConfig} --outputFile=${testResultsPath}`,
      {
        cwd: testSpace,
      }
    );

    // const lintResults = await fsExtra.readJson(eslintResultsPath);
    const testResults = await fsExtra.readJson(testResultsPath);
    await fsExtra.remove(repoLocalPath);
    return c.json({ testResults });
  } catch (error) {
    console.error("Error:", error);
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  } finally {
    try {
      if (fsExtra.existsSync(repoLocalPath)) {
        await fsExtra.remove(repoLocalPath);
      }
    } catch (cleanupError) {
      console.error("Cleanup Error:", cleanupError);
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
