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
  const eslintConfig = path.join(testSpace, "eslint.config.js");
  const vitestConfig = path.join(testSpace, "vitest.config.js");
  const eslintResultsFile = path.join(repoLocalPath, "eslint-results.json");
  const testResultsFile = path.join(repoLocalPath, "test-results.json");

  try {
    if (
      !repo ||
      repo === "" ||
      repo === undefined ||
      repo === null ||
      repo.length <= 3
    ) {
      throw new HTTPException(400, {
        message:
          "Your Github repo is required, please fork the appropiate repo, complete the checkpoint, and try again.",
      });
    }

    invariant(username, "username is required");
    if (!fsExtra.existsSync(repoLocalPath)) {
      fsExtra.mkdirSync(repoLocalPath, { recursive: true });
    }

    await git.cwd(repoLocalPath);
    await git.clone(githubRepoUrl, repoLocalPath);

    const eslintCommand = `npx eslint . --config=${eslintConfig} -f json -o ${eslintResultsFile}`;
    const vitestCommand = `npx vitest run --config=${vitestConfig} --reporter=json --outputFile=${testResultsFile}`;

    const { stderr: iStderr } = await exec("npm install", {
      cwd: repoLocalPath,
    });
    if (iStderr) {
      throw new HTTPException(500, {
        message: iStderr,
      });
    }
    const { stderr: esLintStderr } = await exec(eslintCommand, {
      cwd: testSpace,
    });
    if (esLintStderr) {
      throw new HTTPException(500, {
        message: esLintStderr,
      });
    }
    const { stderr: viestStderr } = await exec(vitestCommand, {
      cwd: testSpace,
    });
    if (viestStderr) {
      throw new HTTPException(500, {
        message: viestStderr,
      });
    }

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
