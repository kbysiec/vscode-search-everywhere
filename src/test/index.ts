/*
  source:
  https://rpeshkov.net/blog/vscode-extension-coverage/
  https://github.com/rpeshkov/vscode-testcov
*/

import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import CoverageRunner, { ITestRunnerOptions } from "./coverageRunner";

const Mocha = require("mocha");

// Linux: prevent a weird NPE when mocha on Linux requires the window size from the TTY
// Since we are not running in a tty environment, we just implement he method statically
const tty = require("tty");
if (!tty.getWindowSize) {
  tty.getWindowSize = (): number[] => {
    return [80, 75];
  };
}

let mocha = new Mocha({
  timeout: 4000
});

mocha.color(true);

function configure(mochaOpts: any): void {
  mocha = new Mocha(mochaOpts);
}

function readCoverageConfig(testsRoot: string): ITestRunnerOptions | undefined {
  const coverageConfigPath = path.join(
    testsRoot,
    "..",
    "..",
    "..",
    "coverage-report-config.json"
  );
  if (fs.existsSync(coverageConfigPath)) {
    const configContent = fs.readFileSync(coverageConfigPath, "utf-8");
    return JSON.parse(configContent);
  }
  return undefined;
}

function run(testsRoot: string, clb: any): any {
  // Read configuration for the coverage file
  const coverOptions = readCoverageConfig(testsRoot);
  if (coverOptions && coverOptions.enabled) {
    // Setup coverage pre-test, including post-test hook to report
    const coverageRunner = new CoverageRunner(coverOptions, testsRoot);
    coverageRunner.setupCoverage();
  }

  // Glob test files
  glob(
    "**/**.test.js",
    { cwd: path.join(testsRoot, "..") },
    (error, files): any => {
      if (error) {
        return clb(error);
      }
      try {
        // Fill into Mocha
        files.forEach(
          (f): Mocha => mocha.addFile(path.join(testsRoot, "..", f))
        );
        // Run the tests
        let failureCount = 0;

        mocha
          .run()
          .on("fail", () => failureCount++)
          .on("end", () => clb(undefined, failureCount));
      } catch (error) {
        return clb(error);
      }
    }
  );
}

exports.configure = configure;
exports.run = run;
