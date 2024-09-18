import path from "node:path";
import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";

export const TEST_SPACE = "__testspace__";
const gitBaseDir = path.resolve(process.cwd(), TEST_SPACE);
const options: Partial<SimpleGitOptions> = {
  baseDir: gitBaseDir,
  binary: "git",
  //   maxConcurrentProcesses: 6,
  trimmed: false,
};

export const git: SimpleGit = simpleGit(options);
