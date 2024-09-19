import path from "node:path";
import fsExtra from "fs-extra";
import { exec } from "./exec";

/**
 * Run the ESLint linter on a repository
 * @param eslintConfigFile - The path to the ESLint configuration file
 * @param checkpointDir - The path to the repository to lint
 * @param lintResultFile - The path to write the lint results to
 */
export async function runLinter(
  eslintConfigFile: string,
  checkpointDir: string,
  lintResultFile: string
) {
  const eslintCommand = `npx eslint . --config=${eslintConfigFile} -f json -o ${lintResultFile} --cache`;
  return exec(eslintCommand, { cwd: checkpointDir });
}

/**
 * Run tests using Vitest
 * @param vitestConfigFile - The path to the Vitest configuration file
 * @param checkpointDir - The path to the repository to test
 * @param testResultFile - The path to write the test results to
 */
export async function runTests(
  vitestConfigFile: string,
  testEnvironment: string,
  checkpointDir: string,
  testResultFile: string
) {
  const vitestCommand = `npx vitest --run --environment=${testEnvironment} --config=${vitestConfigFile} --reporter=json --outputFile=${testResultFile}`;
  return exec(vitestCommand, { cwd: checkpointDir });
}

/**
 * Clean up directories
 * @param dirs - The directories to clean up
 */
export function cleanUp(...dirs: string[]) {
  dirs.forEach(async (dir) => {
    if (fsExtra.existsSync(dir)) {
      await fsExtra.remove(dir);
    }
  });
}
