#!/usr/bin/env node

/**
 * Publishing script for VS Code Marketplace (vsce) & Open VSX Registry (ovsx).
 * Reads personal access tokens from `local.properties` (or environment variables).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const PROPERTIES_PATH = path.join(ROOT_DIR, "local.properties");
const EXAMPLE_PATH = path.join(ROOT_DIR, "local.properties.example");
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, "package.json");

// ANSI color helpers
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function parseProperties(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const properties = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) {
      return;
    }
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      properties[key] = val;
    }
  });

  return properties;
}

function getTokens(properties) {
  const vsceToken =
    properties["VSCE_PAT"] ||
    properties["VSCE_TOKEN"] ||
    properties["vsce.pat"] ||
    properties["vsce.token"] ||
    process.env.VSCE_PAT ||
    process.env.VSCE_TOKEN ||
    "";

  const ovsxToken =
    properties["OVSX_PAT"] ||
    properties["OVSX_TOKEN"] ||
    properties["ovsx.pat"] ||
    properties["ovsx.token"] ||
    process.env.OVSX_PAT ||
    process.env.OVSX_TOKEN ||
    "";

  return {
    vsceToken: isPlaceholder(vsceToken) ? "" : vsceToken,
    ovsxToken: isPlaceholder(ovsxToken) ? "" : ovsxToken,
  };
}

function isPlaceholder(token) {
  return (
    !token ||
    token.includes("your_") ||
    token.includes("token_here") ||
    token.includes("ENTER_YOUR_")
  );
}

function run(cmd, desc) {
  log(`\n⏳ ${desc}...`, colors.cyan);
  log(`$ ${cmd}`, colors.blue);
  try {
    execSync(cmd, { cwd: ROOT_DIR, stdio: "inherit" });
    return true;
  } catch (err) {
    log(`❌ Failed: ${desc}`, colors.red);
    return false;
  }
}

function findVsixFile(version) {
  const files = fs.readdirSync(ROOT_DIR);
  const matched = files.filter(
    (f) => f.endsWith(".vsix") && (!version || f.includes(version))
  );
  if (matched.length === 0) {
    const anyVsix = files.filter((f) => f.endsWith(".vsix"));
    return anyVsix.length > 0 ? path.join(ROOT_DIR, anyVsix[0]) : null;
  }
  // Return the latest matched vsix
  return path.join(ROOT_DIR, matched[matched.length - 1]);
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run") || args.includes("--package-only");
  const targetVsce = args.includes("--vsce-only") || args.includes("--target=vsce");
  const targetOvsx = args.includes("--ovsx-only") || args.includes("--target=ovsx");
  const skipPackage = args.includes("--skip-package");

  log("==================================================", colors.bold);
  log(" 🚀 Search Everywhere Marketplace Publisher", colors.bold + colors.green);
  log("==================================================", colors.bold);

  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
  const version = packageJson.version;
  log(`Package: ${packageJson.name} v${version}\n`);

  if (!fs.existsSync(PROPERTIES_PATH)) {
    log(`⚠️  Warning: '${path.basename(PROPERTIES_PATH)}' was not found!`, colors.yellow);
    log(`👉 Create one by copying '${path.basename(EXAMPLE_PATH)}':`);
    log(`   cp local.properties.example local.properties\n`);
  }

  const properties = parseProperties(PROPERTIES_PATH);
  const { vsceToken, ovsxToken } = getTokens(properties);

  let vsixPath = null;

  if (skipPackage) {
    vsixPath = findVsixFile(version);
    if (!vsixPath) {
      log(`❌ No .vsix file found in ${ROOT_DIR}. Cannot skip packaging.`, colors.red);
      process.exit(1);
    }
    log(`📦 Using existing package: ${path.basename(vsixPath)}`, colors.green);
  } else {
    // 1. Compile project
    if (!run("npm run compile", "Compiling TypeScript")) {
      process.exit(1);
    }

    // 2. Package .vsix
    if (!run("npx -y @vscode/vsce package --no-git-tag-version", "Creating .vsix extension package")) {
      process.exit(1);
    }

    vsixPath = findVsixFile(version);
    if (!vsixPath) {
      log(`❌ Packaging completed but no .vsix file was found.`, colors.red);
      process.exit(1);
    }
    log(`📦 Created package: ${path.basename(vsixPath)}`, colors.green);
  }

  if (isDryRun) {
    log(`\n✅ Dry-run completed. Package is ready at: ${vsixPath}`, colors.bold + colors.green);
    process.exit(0);
  }

  let publishedCount = 0;
  let errorCount = 0;

  // 3. Publish to Visual Studio Code Marketplace
  if (!targetOvsx) {
    log("\n--------------------------------------------------", colors.cyan);
    log(" 🔷 Publishing to VS Code Marketplace (VSCE)", colors.bold + colors.cyan);
    log("--------------------------------------------------", colors.cyan);

    if (!vsceToken) {
      log("⚠️  Skipping VSCE: VSCE_PAT token not found in local.properties or environment.", colors.yellow);
    } else {
      const vsceCmd = `npx -y @vscode/vsce publish --packagePath "${vsixPath}" -p "${vsceToken}"`;
      if (run(vsceCmd, "Publishing to Visual Studio Marketplace")) {
        log("🎉 Successfully published to Visual Studio Marketplace!", colors.bold + colors.green);
        publishedCount++;
      } else {
        errorCount++;
      }
    }
  }

  // 4. Publish to Open VSX Registry
  if (!targetVsce) {
    log("\n--------------------------------------------------", colors.blue);
    log(" 🌐 Publishing to Open VSX Registry (OVSX)", colors.bold + colors.blue);
    log("--------------------------------------------------", colors.blue);

    if (!ovsxToken) {
      log("⚠️  Skipping Open VSX: OVSX_PAT token not found in local.properties or environment.", colors.yellow);
    } else {
      const ovsxCmd = `npx -y ovsx publish "${vsixPath}" -p "${ovsxToken}"`;
      if (run(ovsxCmd, "Publishing to Open VSX Registry")) {
        log("🎉 Successfully published to Open VSX Registry!", colors.bold + colors.green);
        publishedCount++;
      } else {
        errorCount++;
      }
    }
  }

  log("\n==================================================", colors.bold);
  if (errorCount > 0) {
    log(`❌ Finished with ${errorCount} error(s).`, colors.bold + colors.red);
    process.exit(1);
  } else if (publishedCount === 0) {
    log("⚠️  No marketplaces were published to. Please provide tokens in local.properties.", colors.yellow);
  } else {
    log(`🎉 All requested marketplaces successfully published (${publishedCount})!`, colors.bold + colors.green);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
