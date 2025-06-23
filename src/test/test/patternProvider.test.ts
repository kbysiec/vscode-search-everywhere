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
    it("should return include patterns", () => {
      const includePatterns =
        setups.getIncludePatterns.setupForReturningIncludePatterns();

      assert.equal(patternProvider.getIncludePatterns(), includePatterns);
    });
  });

  describe("getExcludePatterns", () => {
    it("should return exclude patterns from extension settings where exclude mode is set to 'search everywhere'", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForSearchEverywhereExcludeMode();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it("should return exclude patterns from files and search settings where exclude mode is set to 'files and search'", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForFilesAndSearchExcludeMode();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it("should return exclude patterns from gitignore file where exclude mode is set to 'gitignore'", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForGitignoreExcludeMode();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it("should return exclude patterns separated with comma and surrounded with curly braces if there are two or more patterns", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForMultiplePatternsWithCurlyBraces();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it("should return exclude pattern without comma and surrounding of curly braces if there is only one pattern", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForSinglePatternWithoutCurlyBraces();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });

    it("should return empty string if there is not any pattern", async () => {
      const excludePatterns =
        setups.getExcludePatterns.setupForEmptyPatternsArray();

      assert.equal(await patternProvider.getExcludePatterns(), excludePatterns);
    });
  });

  describe("fetchConfig", () => {
    it("should fetch exclude mode", async () => {
      const excludeMode = setups.fetchConfig.setupForFetchingExcludeMode();
      await patternProvider.fetchConfig();
      assert.equal(patternProvider.getExcludeMode(), excludeMode);
    });

    it("should fetch include patterns", async () => {
      const includePatterns =
        setups.fetchConfig.setupForFetchingIncludePatterns();
      await patternProvider.fetchConfig();
      assert.equal(patternProvider.getIncludePatterns(), includePatterns);
    });

    it("should fetch extension exclude patterns", async () => {
      const extensionExcludePatterns =
        setups.fetchConfig.setupForFetchingExtensionExcludePatterns();
      await patternProvider.fetchConfig();
      assert.equal(
        patternProvider.getExtensionExcludePatterns(),
        extensionExcludePatterns
      );
    });

    it("should fetch files and search exclude patterns", async () => {
      const filesAndSearchExcludePatterns =
        setups.fetchConfig.setupForFetchingFilesAndSearchExcludePatterns();
      await patternProvider.fetchConfig();
      assert.equal(
        patternProvider.getFilesAndSearchExcludePatterns(),
        filesAndSearchExcludePatterns
      );
    });

    it("should fetch gitignore exclude patterns if file is found", async () => {
      const gitignoreExcludePatterns =
        setups.fetchConfig.setupForFetchingGitignoreExcludePatternsWhenFileFound();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });

    it("should set exclude patterns from extension settings if gitignore file is not found", async () => {
      const gitignoreExcludePatterns =
        setups.fetchConfig.setupForFallingBackToExtensionSettingsWhenGitignoreNotFound();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });

    it("should set exclude patterns from extension settings if gitignore file is found but is empty", async () => {
      const gitignoreExcludePatterns =
        setups.fetchConfig.setupForFallingBackToExtensionSettingsWhenGitignoreEmpty();
      await patternProvider.fetchConfig();
      assert.deepEqual(
        patternProvider.getGitignoreExcludePatterns(),
        gitignoreExcludePatterns
      );
    });
  });
});
