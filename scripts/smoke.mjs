import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const site = new URL(process.env.SITE_URL || "https://auu-ahh-cafe-menu.vercel.app");
if (site.protocol !== "https:" || site.username || site.password) throw new Error("Smoke checks require an HTTPS URL without credentials.");
const checks = [];
const report = { checkedAt: new Date().toISOString(), site: site.origin, sourceCommit: null, htmlLatencyMs: null, checks };

async function request(path) {
  const start = performance.now();
  const response = await fetch(new URL(path, site), { redirect: "error", signal: AbortSignal.timeout(10_000) });
  return { response, latencyMs: Math.round(performance.now() - start) };
}
function check(name, passed) {
  checks.push({ name, passed });
  if (!passed) throw new Error(`Smoke check failed: ${name}`);
}

try {
  const { response: home, latencyMs } = await request("/");
  report.htmlLatencyMs = latencyMs;
  check("homepage HTTP 200", home.status === 200);
  check("HTML response within 5000ms", latencyMs <= 5000);
  const html = await home.text();
  check("Indonesian catalog has 32 menu rows", html.includes('lang="id"') && (html.match(/data-testid="menu-item"/g)?.length === 32));
  check("security headers", home.headers.get("x-content-type-options") === "nosniff" && home.headers.get("x-frame-options") === "DENY" && !!home.headers.get("content-security-policy")?.includes("object-src 'none'"));
  const { response: infoResponse } = await request("/build-info.json");
  check("release metadata available", infoResponse.status === 200);
  const info = await infoResponse.json();
  check("published source commit", /^[a-f0-9]{40}$/.test(info.sourceCommit) && (!process.env.EXPECTED_COMMIT || info.sourceCommit === process.env.EXPECTED_COMMIT));
  report.sourceCommit = info.sourceCommit;
  const { response: pdf } = await request("/menu-asli.pdf");
  check("source PDF available", pdf.status === 200 && !!pdf.headers.get("content-type")?.includes("application/pdf"));
  const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
  check("source PDF unchanged", digest(Buffer.from(await pdf.arrayBuffer())) === digest(await readFile("public/menu-asli.pdf")));
  for (const path of ["/.env", "/.env.local", "/.env.production", "/.git/config", "/package.json", "/scripts/deploy.mjs", "/build-manifest.json"]) {
    const { response } = await request(path);
    check(`private path returns 404: ${path}`, response.status === 404);
  }
  report.status = "passed";
} catch (error) {
  report.status = "failed";
  report.error = error.message;
  process.exitCode = 1;
} finally {
  await mkdir("evidence", { recursive: true });
  await writeFile("evidence/smoke.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
