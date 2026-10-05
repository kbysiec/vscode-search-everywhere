import * as child_process from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

/**
 * Executes a Git command safely with timeout.
 */
export function execGit(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    child_process.execFile(
      "git",
      args,
      { cwd, timeout: 5000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}

/**
 * Returns a unique, stable fingerprint for a Git repository.
 * Derives hash from remote.origin.url or root commit hash.
 */
export async function getRepoFingerprint(rootPath: string): Promise<string | undefined> {
  try {
    let identifier: string | undefined;

    // 1. Try git remote origin url
    try {
      identifier = await execGit(["config", "--get", "remote.origin.url"], rootPath);
    } catch {
      // Ignore error if remote doesn't exist
    }

    // 2. Fallback to initial root commit hash
    if (!identifier) {
      try {
        const rootCommit = await execGit(["rev-list", "--max-parents=0", "HEAD"], rootPath);
        if (rootCommit) {
          identifier = rootCommit.split("\n")[0].trim();
        }
      } catch {
        // Ignore error if repo has no commits or git is not present
      }
    }

    if (!identifier) {
      return undefined;
    }

    // Normalize URL (strip protocol, user, trailing .git)
    const normalized = identifier
      .replace(/^https?:\/\/github\.com\//, "github.com/")
      .replace(/^git@github\.com:/, "github.com/")
      .replace(/\.git$/, "")
      .trim();

    return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  } catch {
    return undefined;
  }
}

/**
 * Returns a list of absolute file paths that are modified, staged, or untracked in Git working tree.
 */
export async function getModifiedOrUntrackedFiles(rootPath: string): Promise<string[]> {
  try {
    const statusOutput = await execGit(["status", "--porcelain", "-uall"], rootPath);
    if (!statusOutput) {
      return [];
    }

    const modifiedPaths: string[] = [];
    const lines = statusOutput.split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.length < 3) {
        continue;
      }

      // Format: XY <path> or XY <old> -> <new>
      const pathPart = line.substring(2).trim();
      const actualRelative = pathPart.includes(" -> ")
        ? pathPart.split(" -> ")[1].trim()
        : pathPart;

      const fullPath = path.isAbsolute(actualRelative)
        ? actualRelative
        : path.join(rootPath, actualRelative);

      if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
        modifiedPaths.push(fullPath);
      }
    }

    return modifiedPaths;
  } catch {
    return [];
  }
}

export const gitService = {
  execGit,
  getRepoFingerprint,
  getModifiedOrUntrackedFiles,
};
