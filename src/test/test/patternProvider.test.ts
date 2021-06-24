import { assert } from "chai";
import Config from "../../config";
import PatternProvider from "../../patternProvider";
import { getTestSetups } from "../testSetup/patternProvider.testSetup";
import { getConfigStub } from "../util/stubFactory";

describe("PatternProvider", () => {
  let configStub: Config = getConfigStub();
  let patternProvider: PatternProvider = new PatternProvider(configStub);
  let setups = getTestSetups(patternProvider);

  beforeEach(() => {
    configStub = getConfigStub();
    patternProvider = new PatternProvider(configStub);
    setups = getTestSetups(patternProvider);
  });

  describe("getIncludePatterns", () => {
    it("1: should return include patterns", () => {
      const patterns = setups.getIncludePatterns1();

      assert.equal(patternProvider.getIncludePatterns(), patterns);
    });
  });

  describe("getExcludePatterns", () => {
    it(`1: should return exclude patterns from extension settings
      where exclude mode is set to 'search everywhere'`, async () => {
      const expected = setups.getExcludePatterns1();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });

    it(`2: should return exclude patterns from files and search settings
      where exclude mode is set to 'files and search'`, async () => {
      const expected = setups.getExcludePatterns2();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });

    it(`3: should return exclude patterns from gitignore file
      where exclude mode is set to 'gitignore' and patterns are cached`, async () => {
      const expected = setups.getExcludePatterns3();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });

    it(`4: should return exclude patterns from gitignore file
      where exclude mode is set to 'gitignore' and file is found and patterns are not cached`, async () => {
      const expected = setups.getExcludePatterns4();
      const actual = await patternProvider.getExcludePatterns(true);

      assert.equal(actual, expected);
    });

    it(`5: should return exclude patterns from extension settings
      where exclude mode is set to 'gitignore' and file is not found`, async () => {
      const expected = setups.getExcludePatterns5();
      const actual = await patternProvider.getExcludePatterns(true);

      assert.equal(actual, expected);
    });

    it(`6: should return exclude patterns from extension settings
      where exclude mode is set to 'gitignore' and file is found but is empty`, async () => {
      const expected = setups.getExcludePatterns6();
      const actual = await patternProvider.getExcludePatterns(true);

      assert.equal(actual, expected);
    });

    it(`7: should return exclude patterns separated with comma and surrounded with curly braces
      if there are two or more patterns`, async () => {
      const expected = setups.getExcludePatterns7();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });

    it(`8: should return exclude pattern without comma and surrounding of curly braces
      if there is only one pattern'`, async () => {
      const expected = setups.getExcludePatterns8();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });

    it(`9: should return empty string if there is not any pattern'`, async () => {
      const expected = setups.getExcludePatterns9();
      const actual = await patternProvider.getExcludePatterns(false);

      assert.equal(actual, expected);
    });
  });
});
