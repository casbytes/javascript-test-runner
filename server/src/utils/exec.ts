import { spawn } from "node:child_process";

interface ExecOptions {
  cwd?: string;
}

interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

export async function exec(
  command: string,
  options: ExecOptions = {}
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, ...options });

    let stdout = "";
    let stderr = "";

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("exit", (code) => {
      resolve({ stdout, stderr, code });
    });

    child.on("error", (error) => {
      resolve({
        stdout,
        stderr: error.message,
        code: null,
      });
    });
  });
}
