import { assert } from "chai";
import { patternProvider } from "../../patternProvider";
import { getTestSetups } from "../testSetup/patternProvider.testSetup";

type SetupsType = ReturnType<typeof getTestSetups>;

describe("PatternProvider", () => {
  let setups: SetupsType;

  before(() => {
    setups = getTestSetups();
  });
  afterEach(() => setups.afterEach());

  describe("getIncludePatterns", () => {
    it("1: should return include patterns", () => {
      const includePatterns = setups.getIncludePatterns1();

      assert.equal(patternProvider.getIncludePatterns(), includePatterns);
    });
  });

  describe("getExcludePatterns", () => {
    it(`1: should return exclude patterns from extension settings
      where exclude mode is set to 'search everywhere'`, async () => {
      const excludePatterns = setups.getExcludePatterns1();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it(`2: should return exclude patterns from files and search settings
      where exclude mode is set to 'files and search'`, async () => {
      const excludePatterns = setups.getExcludePatterns2();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it(`3: should return exclude patterns from gitignore file
      where exclude mode is set to 'gitignore'`, async () => {
      const excludePatterns = setups.getExcludePatterns3();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it(`4: should return exclude patterns separated with comma and surrounded with curly braces
      if there are two or more patterns`, async () => {
      const excludePatterns = setups.getExcludePatterns4();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it(`5: should return exclude pattern without comma and surrounding of curly braces
      if there is only one pattern'`, async () => {
      const excludePatterns = setups.getExcludePatterns5();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it(`6: should return empty string if there is not any pattern'`, async () => {
      const excludePatterns = setups.getExcludePatterns6();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });
  });

  describe("fetchConfig", () => {
    it("1: should fetch exclude mode", async () => {
      const excludeMode = setups.fetchConfig1();
      await patternProvider.fetchConfig();
      assert.equal(patternProvider.getExcludeMode(), excludeMode);
    });

    it("2: should fetch include patterns", async () => {
      const includePatterns = setups.fetchConfig2();
      await patternProvider.fetchConfig();
      assert.equal(patternProvider.getIncludePatterns(), includePatterns);
    });

    it("3: should fetch extension exclude patterns", async () => {
      const extensionExcludePatterns = setups.fetchConfig3();
      await patternProvider.fetchConfig();
      assert.equal(
        patternProvider.getExtensionExcludePatterns(),
        extensionExcludePatterns
      );
    });

    it("4: should fetch files and search exclude patterns", async () => {
      const filesAndSearchExcludePatterns = setups.fetchConfig4();
      await patternProvider.fetchConfig();
      assert.equal(
        patternProvider.getFilesAndSearchExcludePatterns(),
        filesAndSearchExcludePatterns
      );
    });

    it("5: should fetch gitignore exclude patterns if file is found", async () => {
      const gitignoreExcludePatterns = setups.fetchConfig5();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });

    it("6: should set exclude patterns from extension settings if gitignore file is not found", async () => {
      const gitignoreExcludePatterns = setups.fetchConfig6();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });

    it("7: should set exclude patterns from extension settings if gitignore file is found but is empty", async () => {
      const gitignoreExcludePatterns = setups.fetchConfig7();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });
  });
});
