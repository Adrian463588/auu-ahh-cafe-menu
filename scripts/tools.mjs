import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Digests verified against the release checksum files in the publishers' repositories.
const tools = {
  gitleaks: {
    repository: "gitleaks/gitleaks", version: "8.30.1",
    linux: ["gitleaks_8.30.1_linux_x64.tar.gz", "551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb"],
    win32: ["gitleaks_8.30.1_windows_x64.zip", "d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e"],
  },
  actionlint: {
    repository: "rhysd/actionlint", version: "1.7.12",
    linux: ["actionlint_1.7.12_linux_amd64.tar.gz", "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8"],
    win32: ["actionlint_1.7.12_windows_amd64.zip", "6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9"],
  },
};

export const toolPath = (name) => resolve(".cache", "tools", name, name + (process.platform === "win32" ? ".exe" : ""));

async function install() {
  if (process.arch !== "x64" || !["linux", "win32"].includes(process.platform)) throw new Error("Pinned tooling supports Linux x64 and Windows x64.");
  for (const [name, tool] of Object.entries(tools)) {
    const [asset, expected] = tool[process.platform];
    const directory = resolve(".cache", "tools", name);
    await mkdir(directory, { recursive: true });
    const archive = resolve(directory, asset);
    let bytes;
    try { bytes = await readFile(archive); } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (!bytes) {
      const response = await fetch(`https://github.com/${tool.repository}/releases/download/v${tool.version}/${asset}`, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`Tool download failed: ${name}, HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    if (createHash("sha256").update(bytes).digest("hex") !== expected) throw new Error(`Tool checksum mismatch: ${name}`);
    await writeFile(archive, bytes);
    execFileSync("tar", ["-xf", archive, "-C", directory, name + (process.platform === "win32" ? ".exe" : "")]);
    console.log(`Verified ${name} ${tool.version} (SHA-256).`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "lint") execFileSync(toolPath("actionlint"), [], { stdio: "inherit" });
  else await install();
}
