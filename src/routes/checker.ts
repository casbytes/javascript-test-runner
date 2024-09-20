import path from "node:path";
import invariant from "tiny-invariant";
import fsExtra from "fs-extra";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { receiver } from "../utils/qstash";
import { exec } from "../utils/exec";

type RequestBody = {
  username: string;
  testEnvironment: "python" | "node" | "browser";
  checkpointPath: string;
  repo: string;
};

const { BASE_URL } = process.env;

const checker = new Hono();

checker.post("/:username", async (c) => {
  const signature = c.req.header("Upstash-Signature");
  const body = await c.req.text();

  invariant(signature, "Signature is required");
  invariant(body, "Request body is required");

  /**
   * checkpoint structure
   * checkpoint_name -----
   *                      |--- src
   *                              |--- exercises
   *                      |--- __tests__
   */

  /**
   * #############################
   * checker route flow
   * #############################
   *
   * 1. Download the repository
   * 2. extract the checkpoint from the repository using the checkpointcheckpointPath
   * 3. copy the checkpoint folder to ${username}-${repo}
   * 4. Spin up the appropriate docker container given the TEST_ENV and run
   *   the tests`
   * #############################
   * script.sh file flow
   * #############################
   * 5. Run the script.sh file that in turn run lints and write the results
   *  to a lint-results.json file, run tests and write the results to a
   *  test-results.json file. If any error occur that is not as a result of
   *  lint or test failure, write the error to an error.json file.
   */

  const { username, testEnvironment, checkpointPath, repo } =
    c.req.json() as unknown as RequestBody;

  try {
    const isValid = await receiver.verify({
      signature,
      body,
      url: BASE_URL,
    });

    if (!isValid) {
      throw new HTTPException(401, {
        message: "Unauthorized!",
      });
    }
    // const rootDir = path.join(process.cwd(), "data");
    // const projectDirName = `${username}-${repo}`;

    return c.json({ success: true });
  } catch (error) {
    throw new HTTPException(500, {
      message:
        error instanceof Error ? error.message : "Internal server error.",
    });
  }
});

export { checker };
