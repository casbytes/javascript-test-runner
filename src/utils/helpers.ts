import fsExtra from "fs-extra";

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
