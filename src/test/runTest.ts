import * as path from "path";

import { runTests } from "vscode-test";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, "./index");

    const vscodeExecutablePath =
      process.platform === "darwin"
        ? "/Applications/Visual Studio Code.app/Contents/MacOS/Code"
        : undefined;

    const userDataDir = path.resolve(__dirname, "../../.vscode-test/user-data");

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      vscodeExecutablePath,
      launchArgs: ["--disable-extensions", `--user-data-dir=${userDataDir}`],
    });
  } catch (err) {
    console.error("Failed to run tests:", err);
    process.exit(1);
  }
}

main();
