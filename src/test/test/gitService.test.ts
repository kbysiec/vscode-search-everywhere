import { assert } from "chai";
import * as path from "path";
import { gitService } from "../../gitService";

describe("gitService", () => {
  const projectRoot = path.resolve(__dirname, "../../../");

  describe("getRepoFingerprint", () => {
    it("should return a 16-character hexadecimal fingerprint for current repo", async () => {
      const fingerprint = await gitService.getRepoFingerprint(projectRoot);
      assert.isDefined(fingerprint);
      assert.isString(fingerprint);
      assert.equal(fingerprint!.length, 16);
    });

    it("should return undefined gracefully for a non-existent or non-git directory", async () => {
      const nonGitDir = path.resolve(projectRoot, "node_modules");
      const nonExistent = "/tmp/does-not-exist-" + Date.now();
      const result = await gitService.getRepoFingerprint(nonExistent);
      assert.isUndefined(result);
    });
  });

  describe("getModifiedOrUntrackedFiles", () => {
    it("should return an array of file paths for current git repository", async () => {
      const modifiedFiles = await gitService.getModifiedOrUntrackedFiles(projectRoot);
      assert.isArray(modifiedFiles);
    });

    it("should return an empty array for an invalid path without throwing", async () => {
      const nonExistent = "/tmp/does-not-exist-" + Date.now();
      const result = await gitService.getModifiedOrUntrackedFiles(nonExistent);
      assert.deepEqual(result, []);
    });
  });
});
