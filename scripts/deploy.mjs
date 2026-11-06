import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const token = process.env.VERCEL_TOKEN;
const projectName = "auu-ahh-cafe-menu";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

async function api(path, body) {
  const response = await fetch(`https://api.vercel.com${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Vercel ${response.status}: ${data.error?.message ?? data.error?.code ?? "Request failed"}`);
  return data;
}

async function outputFiles(directory = "out", prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    const file = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await outputFiles(path, `${file}/`));
    else {
      if (file.split("/").some((part) => part.startsWith(".env") || part === ".git")) throw new Error("Forbidden deployment file.");
      const contents = await readFile(path);
      if (contents.includes(Buffer.from(token))) throw new Error(`Secret detected in output: ${file}`);
      files.push({ file, data: contents.toString("base64"), encoding: "base64" });
    }
  }
  return files;
}

async function main() {
  if (!token) throw new Error("Set VERCEL_TOKEN in the ignored local .env file.");
  const teams = (await api("/v2/teams")).teams;
  const candidates = teams.filter((team) => team.billing?.plan === "hobby" && (!process.env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID === team.id));
  if (candidates.length !== 1) throw new Error("Exactly one selected Hobby team is required. No paid plan will be used.");
  const team = candidates[0];
  console.log(`Verified plan: hobby (${team.slug}). No upgrades or add-ons.`);
  if (git("status", "--porcelain")) throw new Error("Commit the intended source files before deploying.");
  const sha = git("rev-parse", "HEAD");
  const branch = git("branch", "--show-current");
  if (git("ls-remote", "origin", `refs/heads/${branch}`).split(/\s/)[0] !== sha) throw new Error("Push the exact local commit before deploying.");
  const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
  for (const file of tracked) {
    if (file.startsWith(".env") && file !== ".env.example") throw new Error("An environment file is tracked by Git.");
    if ((await readFile(file)).includes(Buffer.from(token))) throw new Error(`Secret detected in tracked file: ${file}`);
  }

  // Build the pushed state locally; upload only the static export, never .env or source credentials.
  execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit" });
  const files = await outputFiles();
  files.push({ file: "vercel.json", data: (await readFile("vercel.json")).toString("base64"), encoding: "base64" });
  const digest = createHash("sha256").update(JSON.stringify(files)).digest("hex");
  const query = `?teamId=${encodeURIComponent(team.id)}`;
  let project;
  try {
    project = JSON.parse(await readFile(".vercel/project.json", "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (project) {
    if (project.orgId !== team.id) throw new Error("Saved project belongs to a different team.");
    const existing = await api(`/v9/projects/${project.projectId}${query}`);
    if (existing.name !== projectName) throw new Error("Unexpected saved project name.");
  } else {
    const created = await api(`/v10/projects${query}`, { name: projectName, framework: null, buildCommand: "", installCommand: "", outputDirectory: "." });
    project = { projectId: created.id, orgId: team.id };
    await mkdir(".vercel", { recursive: true });
    await writeFile(".vercel/project.json", JSON.stringify(project, null, 2));
  }
  const deployment = await api(`/v13/deployments${query}`, {
    name: projectName, project: project.projectId, target: "production", files,
    projectSettings: { framework: null, buildCommand: "", installCommand: "", outputDirectory: "." },
    gitMetadata: { remoteUrl: git("remote", "get-url", "origin"), commitSha: sha, commitRef: branch, dirty: false },
    meta: { sourceCommit: sha, artifactSha256: digest },
  });
  const record = { deploymentId: deployment.id, projectId: project.projectId, teamId: team.id, plan: "hobby", sourceCommit: sha, artifactSha256: digest, url: `https://${deployment.url}` };
  await writeFile(".vercel/deployment.json", JSON.stringify(record, null, 2));
  console.log(`Deployment: ${record.url}`);
  let previous;
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = await api(`/v13/deployments/${deployment.id}${query}`);
    if (result.readyState !== previous) console.log(`State: ${result.readyState}`);
    previous = result.readyState;
    if (result.readyState === "READY") {
      const aliases = await api(`/v2/deployments/${deployment.id}/aliases${query}`);
      const productionUrl = aliases.aliases?.find((item) => item.alias === `${projectName}.vercel.app`)?.alias ?? aliases.aliases?.[0]?.alias ?? result.url;
      await writeFile(".vercel/deployment.json", JSON.stringify({ ...record, state: "READY", productionUrl: `https://${productionUrl}` }, null, 2));
      console.log(`Production ready: https://${productionUrl}`);
      return;
    }
    if (["ERROR", "CANCELED"].includes(result.readyState)) throw new Error(`Deployment ${result.readyState}: ${result.errorMessage ?? "Inspect Vercel build logs."}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error("Deployment is still pending. Inspect the saved deployment ID before retrying.");
}

main().catch((error) => { console.error(String(error.message).replaceAll(token || "\0", "[REDACTED]")); process.exitCode = 1; });
