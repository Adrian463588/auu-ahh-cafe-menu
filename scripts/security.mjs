import { mkdir, mkdtemp, copyFile, lstat, rm } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { basename, dirname, resolve } from "node:path";
import { toolPath } from "./tools.mjs";

const executable = toolPath("gitleaks");
const flags = ["--no-banner", "--redact=100", "--config", resolve(".gitleaks.toml")];
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
if (git("rev-parse", "--is-shallow-repository") !== "false") throw new Error("Secret scanning requires the complete Git history (fetch-depth: 0).");
const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
for (const file of tracked) {
  const name = basename(file);
  if (/^\.env(?:\.|$)/.test(name) && name !== ".env.example") throw new Error(`Environment file tracked by Git: ${file}`);
  if (!(await lstat(file)).isFile()) throw new Error(`Only regular source files may be scanned: ${file}`);
}

// A generated, non-functional canary proves our Vercel rule actually blocks a match.
const canary = spawnSync(executable, ["stdin", ...flags], {
  input: "VERCEL_TOKEN=" + "vcp_" + randomBytes(32).toString("hex"), encoding: "utf8",
});
if (canary.error || canary.status !== 1) throw new Error("Gitleaks detection control failed.");
console.log("Gitleaks detection control passed (generated value never printed).");
execFileSync(executable, ["git", ".", "--log-opts=--all", ...flags], { stdio: "inherit" });

const cache = resolve(".cache");
await mkdir(cache, { recursive: true });
const scratch = await mkdtemp(resolve(cache, "secret-scan-"));
if (dirname(scratch) !== cache) throw new Error("Unsafe scanner scratch directory.");
try {
  for (const file of tracked) {
    const target = resolve(scratch, file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(file, target);
  }
  execFileSync(executable, ["dir", scratch, ...flags], { stdio: "inherit" });
  execFileSync(executable, ["dir", "out", ...flags], { stdio: "inherit" });
} finally {
  if (dirname(scratch) === cache) await rm(scratch, { recursive: true, force: true });
}
console.log(`Secret gates passed: all reachable Git history, ${tracked.length} current tracked files, and public export.`);
