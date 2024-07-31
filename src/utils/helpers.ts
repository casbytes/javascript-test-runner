import fsExtra from "fs-extra";
import * as tar from "tar";
import { git } from "./simple-git";
import { exec } from "./exec";
import path from "node:path";
import http from "node:http";

/**
 * Clone a GitHub repository to a local path
 * @param githubUrl - The URL of the GitHub repository to clone
 * @param checkpointDir - The path to clone the repository to
 */
export async function cloneRepo(githubUrl: string, tempCheckpointDir: string) {
  await fsExtra.ensureDir(tempCheckpointDir);
  await git.cwd(tempCheckpointDir);
  await git.clone(githubUrl, tempCheckpointDir, { "--depth": 1 });
}

/**
 * Create a tarball of a directory
 * @param srcDir - The directory to tar
 * @param testsDir - The directory to tar
 * @param outputFile - The path to write the tarball to
 */
export async function createTar(
  srcDir: string,
  testsDir: string,
  outputFile: string
) {
  await fsExtra.ensureFile(outputFile);
  await tar.create(
    { gzip: true, file: outputFile, cwd: path.dirname(srcDir) },
    [path.basename(srcDir), path.basename(testsDir)]
  );
}

/**
 * Extract a tarball to a directory
 * @param file - The path to the tarball
 * @param outputDir - The directory to extract the tarball to
 */
export async function extractTar(file: string, outputDir: string) {
  await fsExtra.ensureDir(outputDir);
  await tar.extract({ file, cwd: outputDir });
}

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
  const eslintCommand = `npx eslint . --config=${eslintConfigFile} -f json -o ${lintResultFile}`;
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
