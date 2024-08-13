import "dotenv/config";
import invariant from "tiny-invariant";
import path from "node:path";
import fsExtra from "fs-extra";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  cleanUp,
  cloneRepo,
  createTar,
  extractTar,
  runLinter,
  runTests,
} from "./utils/helpers";

const app = new Hono();

app.post("/:username", async (c) => {
  const USERNAME = c.req.param("username");
  const REPO = c.req.query("repo");
  const PATH = c.req.query("path");
  const HOST = c.req.header("X-Frontend-For") || "localhost";
  const TEST_ENV = c.req.header("X-Test-Env") as "node" | "browser";
  invariant(REPO, "Repo name is required");
  invariant(USERNAME, "Username is required");
  invariant(PATH, "Checkpoint path is required");
  invariant(TEST_ENV, "Test environment is required");

  const TESTSPACE = path.join(process.cwd(), "__testspace__");
  const REPO_URL = `${USERNAME}/${REPO}`;
  const GITHUB_REPO_URL = `https://github.com/${REPO_URL}.git`;

  const FOLDER_NAME = `${USERNAME}-${REPO}`;
  const CHECKPOINT_TEMP_DIR = path.join(TESTSPACE, `${FOLDER_NAME}.temp`);
  const CHECKPOINT_TAR_DIR = path.join(TESTSPACE, `${FOLDER_NAME}.tar.gz`);

  const CHECKPOINT_PATH = path.join(CHECKPOINT_TEMP_DIR, PATH);
  const CHECKPOINT_DIR = path.join(TESTSPACE, FOLDER_NAME);
  const CHECKPOINT_SRC_DIR = path.join(CHECKPOINT_PATH, "src");
  const CHECKPOINT_TEST_DIR = path.join(CHECKPOINT_PATH, "__tests__");

  const ESLINT_CONFIG = path.join(TESTSPACE, "eslint.config.mjs");
  const VITEST_CONFIG = path.join(TESTSPACE, "vitest.config.ts");
  const ESLINT_RESULTS = path.join(CHECKPOINT_DIR, "lint-results.json");
  const TEST_RESULTS = path.join(CHECKPOINT_DIR, "test-results.json");

  try {
    await cloneRepo(GITHUB_REPO_URL, CHECKPOINT_TEMP_DIR);
    await createTar(
      CHECKPOINT_SRC_DIR,
      CHECKPOINT_TEST_DIR,
      CHECKPOINT_TAR_DIR
    );
    await extractTar(CHECKPOINT_TAR_DIR, CHECKPOINT_DIR);
    const { stderr: lintStderr } = await runLinter(
      ESLINT_CONFIG,
      CHECKPOINT_DIR,
      ESLINT_RESULTS
    );
    const { stderr: testStderr } = await runTests(
      VITEST_CONFIG,
      TEST_ENV,
      CHECKPOINT_DIR,
      TEST_RESULTS
    );

    let error = null;
    let lintResults = null;
    let testResults = null;

    if (lintStderr || testStderr) {
      error = lintStderr || testStderr;
    }

    if (fsExtra.existsSync(ESLINT_RESULTS)) {
      lintResults = await fsExtra.readJson(ESLINT_RESULTS);
    }

    if (fsExtra.existsSync(TEST_RESULTS)) {
      testResults = await fsExtra.readJson(TEST_RESULTS);
    }

    return c.json({ lintResults, testResults, error });
  } catch (error) {
    throw new HTTPException(500, {
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  } finally {
    try {
      cleanUp(CHECKPOINT_TEMP_DIR, CHECKPOINT_TAR_DIR, CHECKPOINT_DIR);
    } catch (cleanupError) {
      console.error(
        `Cleanup error: ${
          cleanupError instanceof Error ? cleanupError.message : cleanupError
        }`
      );
    }
  }
});

app.get("/healthcheck", (c) => {});

export { app };
