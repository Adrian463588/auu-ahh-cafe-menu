import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { prepareRelease, verifyRelease } from "./release.mjs";

const token = process.env.VERCEL_TOKEN;
const projectName = "auu-ahh-cafe-menu";
const staticSettings = { framework: null, buildCommand: "", installCommand: "", outputDirectory: "out" };
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

async function api(path, body, method = body ? "POST" : "GET") {
  const response = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Vercel ${response.status}: ${data.error?.message ?? data.error?.code ?? "Request failed"}`);
  return data;
}

async function assertPublishedCommit(sha) {
  let remote;
  if (process.env.CI) {
    if (process.env.GITHUB_EVENT_NAME !== "push" || process.env.GITHUB_REF !== "refs/heads/main" || process.env.GITHUB_SHA !== sha || process.env.GITHUB_REPOSITORY !== "Adrian463588/auu-ahh-cafe-menu" || !process.env.GITHUB_TOKEN) throw new Error("Only a trusted main push may deploy in CI.");
    const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/git/ref/heads/main`, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Cannot verify current main: HTTP ${response.status}`);
    remote = (await response.json()).object?.sha;
  } else remote = git("ls-remote", "origin", "refs/heads/main").split(/\s/)[0];
  if (remote !== sha) throw new Error("Source commit is not the current pushed main. Refusing a stale deployment.");
}

async function main() {
  if (!token) throw new Error("Configure VERCEL_TOKEN in local .env or the encrypted CI deployment secret.");
  const teams = (await api("/v2/teams")).teams;
  const candidates = teams.filter((team) => team.billing?.plan === "hobby" && (!process.env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID === team.id));
  if (candidates.length !== 1) throw new Error("Exactly one selected Hobby team is required. No paid plan will be used.");
  const team = candidates[0];
  console.log(`Verified plan: hobby (${team.slug}). No upgrades or add-ons.`);
  if (git("status", "--porcelain")) throw new Error("Commit the intended source files before deploying.");
  const sha = git("rev-parse", "HEAD");
  const branch = process.env.CI ? "main" : git("branch", "--show-current");
  if (branch !== "main") throw new Error("Only main may be deployed.");
  const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
  for (const file of tracked) {
    if (/^\.env(?:\.|$)/.test(basename(file)) && basename(file) !== ".env.example") throw new Error("An environment file is tracked by Git.");
    if ((await readFile(file)).includes(Buffer.from(token))) throw new Error(`Secret detected in tracked file: ${file}`);
  }

  if (!process.argv.includes("--prebuilt")) {
    execFileSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
      stdio: "inherit", env: { ...process.env, VERCEL_TOKEN: "", GITHUB_TOKEN: "", GH_TOKEN: "" },
    });
    await prepareRelease({ sourceCommit: sha });
  }
  const release = await verifyRelease({ sourceCommit: sha });
  for (const { file, contents } of release.files) {
    if ([token, process.env.GITHUB_TOKEN].filter(Boolean).some((secret) => contents.includes(Buffer.from(secret)))) throw new Error(`Secret detected in public file: ${file}`);
  }
  const files = release.files.map(({ file, contents }) => ({ file: file === "vercel.json" ? file : `out/${file}`, data: contents.toString("base64"), encoding: "base64" }));
  const digest = release.manifest.artifactSha256;
  const query = `?teamId=${encodeURIComponent(team.id)}`;
  let project = process.env.VERCEL_PROJECT_ID ? { projectId: process.env.VERCEL_PROJECT_ID, orgId: team.id } : undefined;
  let needsOutputUpdate = false;
  if (!project) {
    try {
      project = JSON.parse(await readFile(".vercel/project.json", "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  if (process.env.CI && !project) throw new Error("CI requires the existing VERCEL_PROJECT_ID; it never creates projects.");
  if (project) {
    if (project.orgId !== team.id) throw new Error("Saved project belongs to a different team.");
    const existing = await api(`/v9/projects/${project.projectId}${query}`);
    if (existing.name !== projectName) throw new Error("Unexpected saved project name.");
    needsOutputUpdate = existing.outputDirectory !== staticSettings.outputDirectory;
  } else {
    const created = await api(`/v10/projects${query}`, { name: projectName, ...staticSettings });
    project = { projectId: created.id, orgId: team.id };
  }
  await mkdir(".vercel", { recursive: true });
  await writeFile(".vercel/project.json", JSON.stringify(project, null, 2));
  await assertPublishedCommit(sha);
  if (needsOutputUpdate) {
    const updated = await api(`/v9/projects/${project.projectId}${query}`, { outputDirectory: staticSettings.outputDirectory }, "PATCH");
    if (updated.outputDirectory !== staticSettings.outputDirectory) throw new Error("Project output directory was not persisted.");
    console.log("Reconciled Vercel project output directory: out.");
  }
  const deployment = await api(`/v13/deployments${query}`, {
    name: projectName, project: project.projectId, target: "production", files,
    projectSettings: staticSettings,
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
      const productionUrl = aliases.aliases?.find((item) => item.alias === `${projectName}.vercel.app`)?.alias;
      if (!productionUrl) throw new Error("Production alias was not assigned. Inspect rollback or promotion state before retrying.");
      await writeFile(".vercel/deployment.json", JSON.stringify({ ...record, state: "READY", productionUrl: `https://${productionUrl}` }, null, 2));
      console.log(`Production ready: https://${productionUrl}`);
      if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `production_url=https://${productionUrl}\nsource_commit=${sha}\n`);
      return;
    }
    if (["ERROR", "CANCELED"].includes(result.readyState)) throw new Error(`Deployment ${result.readyState}: ${result.errorMessage ?? "Inspect Vercel build logs."}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error("Deployment is still pending. Inspect the saved deployment ID before retrying.");
}

main().catch((error) => {
  let message = String(error.message);
  for (const secret of [token, process.env.GITHUB_TOKEN].filter(Boolean)) message = message.replaceAll(secret, "[REDACTED]");
  console.error(message);
  process.exitCode = 1;
});
