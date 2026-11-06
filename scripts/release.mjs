import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const defaults = { directory: "out", configPath: "vercel.json", manifestPath: "build-manifest.json" };

async function releaseFiles(directory, configPath) {
  const files = [];
  async function walk(path, prefix = "") {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = `${prefix}${entry.name}`;
      if (entry.name.startsWith(".env") || [".git", ".vercel", ".npmrc"].includes(entry.name) || entry.isSymbolicLink()) throw new Error(`Forbidden public file: ${file}`);
      if (entry.isDirectory()) await walk(resolve(path, entry.name), `${file}/`);
      else if (entry.isFile()) files.push({ file, contents: await readFile(resolve(path, entry.name)) });
      else throw new Error(`Unsupported public file: ${file}`);
    }
  }
  await walk(directory);
  if (files.some(({ file }) => file === "vercel.json")) throw new Error("Forbidden public hosting configuration.");
  files.push({ file: "vercel.json", contents: await readFile(configPath) });
  return files.sort((a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0);
}

const fingerprints = (files) => files.map(({ file, contents }) => ({ file, size: contents.length, sha256: sha256(contents) }));

export async function prepareRelease(options = {}) {
  const { directory, configPath, manifestPath } = { ...defaults, ...options };
  const sourceCommit = options.sourceCommit ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error("Invalid source commit.");
  await readFile(resolve(directory, "index.html"));
  await writeFile(resolve(directory, "build-info.json"), JSON.stringify({ sourceCommit, builtAt: new Date().toISOString() }, null, 2));
  const files = fingerprints(await releaseFiles(directory, configPath));
  const manifest = { schema: 1, sourceCommit, artifactSha256: sha256(JSON.stringify(files)), files };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

export async function verifyRelease(options = {}) {
  const { directory, configPath, manifestPath, sourceCommit } = { ...defaults, ...options };
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.schema !== 1 || !sourceCommit || manifest.sourceCommit !== sourceCommit) throw new Error("Release source commit mismatch.");
  const files = await releaseFiles(directory, configPath);
  const actual = fingerprints(files);
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files) || sha256(JSON.stringify(actual)) !== manifest.artifactSha256) throw new Error("Release integrity check failed.");
  return { manifest, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = await prepareRelease();
  console.log(`Release ${manifest.sourceCommit}: ${manifest.files.length} files, SHA-256 ${manifest.artifactSha256}`);
}
