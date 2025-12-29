import { execSync } from "child_process";

/**
 * Checks for changes in the repository and commits them with a standard message.
 * Uses force push to ensure the remote matches the local state.
 */
export function commitDatabase() {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" });

    if (!status.trim()) {
      return; // No changes to commit
    }

    execSync("git add .", { encoding: "utf8" });
    execSync('git commit -m "chore: data saved"', { encoding: "utf8" });
    execSync("git push -u --force origin HEAD", { encoding: "utf8" });
  } catch (error) {
    console.error(
      "Failed to commit database changes:",
      (error as Error).message,
    );
  }
}
