import path from "node:path";
import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";

const gitBaseDir = path.resolve(process.cwd(), "testspace");
const options: Partial<SimpleGitOptions> = {
  baseDir: gitBaseDir,
  binary: "git",
  //   maxConcurrentProcesses: 6,
  trimmed: false,
};

export const git: SimpleGit = simpleGit(options);
