// import path from "node:path";
// import { describe, it, expect, vi } from "vitest";
// import { app } from "../app";
// import { HTTPException } from "hono/http-exception";
// import {
//   cloneRepo,
//   createTar,
//   extractTar,
//   runLinter,
//   runTests,
//   cleanUp,
// } from "../utils/helpers";
// import fsExtra from "fs-extra";

// vi.mock("../utils/helpers", () => ({
//   cloneRepo: vi.fn(),
//   createTar: vi.fn(),
//   extractTar: vi.fn(),
//   runLinter: vi.fn(),
//   runTests: vi.fn(),
// }));

// describe("Index Route", () => {
//   it("should be defined", () => {
//     expect(app.get).toBeDefined();
//   });
//   it("should return a json message", async () => {
//     const response = await app.request("/");
//     expect(response.status).toBe(200);
//     expect(await response.json()).toEqual({ message: "JavaScript Checker." });
//   });
// });

// describe("Checkpoint Route", () => {
//   it("should be defined", () => {
//     expect(app.post).toBeDefined();
//   });
//   it("should execute the checkpoint process correctly", async () => {
//     const TESTSPACE = "/testspace";
//     const FOLDER_NAME = "folder";
//     const GITHUB_REPO_URL = "https://github.com/repo.git";
//     const CHECKPOINT_TEMP_DIR = "/tempdir";
//     const PATH = "path";
//     const TEST_ENV = "test";

//     const CHECKPOINT_TAR_DIR = path.join(TESTSPACE, `${FOLDER_NAME}.tar.gz`);
//     const CHECKPOINT_PATH = path.join(CHECKPOINT_TEMP_DIR, PATH);
//     const CHECKPOINT_DIR = path.join(TESTSPACE, FOLDER_NAME);
//     const CHECKPOINT_SRC_DIR = path.join(CHECKPOINT_PATH, "src");

//     const ESLINT_CONFIG = path.join(TESTSPACE, "eslint.config.mjs");
//     const VITEST_CONFIG = path.join(TESTSPACE, "vitest.config.ts");
//     const ESLINT_RESULTS = path.join(CHECKPOINT_DIR, "lint-results.json");
//     const TEST_RESULTS = path.join(CHECKPOINT_DIR, "test-results.json");

//     await cloneRepo(GITHUB_REPO_URL, CHECKPOINT_TEMP_DIR);
//     await createTar(CHECKPOINT_SRC_DIR, CHECKPOINT_TAR_DIR);
//     await extractTar(CHECKPOINT_TAR_DIR, CHECKPOINT_DIR);
//     await runLinter(ESLINT_CONFIG, CHECKPOINT_DIR, ESLINT_RESULTS);
//     await runTests(VITEST_CONFIG, TEST_ENV, CHECKPOINT_DIR, TEST_RESULTS);

//     expect(cloneRepo).toHaveBeenCalledWith(
//       GITHUB_REPO_URL,
//       CHECKPOINT_TEMP_DIR
//     );
//     expect(createTar).toHaveBeenCalledWith(
//       CHECKPOINT_SRC_DIR,
//       CHECKPOINT_TAR_DIR
//     );
//     expect(extractTar).toHaveBeenCalledWith(CHECKPOINT_TAR_DIR, CHECKPOINT_DIR);
//     expect(runLinter).toHaveBeenCalledWith(
//       ESLINT_CONFIG,
//       CHECKPOINT_DIR,
//       ESLINT_RESULTS
//     );
//     expect(runTests).toHaveBeenCalledWith(
//       VITEST_CONFIG,
//       TEST_ENV,
//       CHECKPOINT_DIR,
//       TEST_RESULTS
//     );
//   });
// });
