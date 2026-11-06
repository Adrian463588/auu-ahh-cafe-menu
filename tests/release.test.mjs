import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { prepareRelease, verifyRelease } from "../scripts/release.mjs";

test("release checks bind the artifact to its source and detect changed/added files", async () => {
  const cache = resolve(".cache");
  await mkdir(cache, { recursive: true });
  const scratch = await mkdtemp(resolve(cache, "release-test-"));
  assert.equal(dirname(scratch), cache);
  const options = { directory: resolve(scratch, "out"), configPath: resolve(scratch, "vercel.json"), manifestPath: resolve(scratch, "manifest.json"), sourceCommit: "a".repeat(40) };
  try {
    await mkdir(options.directory);
    await writeFile(resolve(options.directory, "index.html"), "Release verification test");
    await writeFile(options.configPath, "{}");
    await prepareRelease(options);
    await verifyRelease(options);
    await assert.rejects(() => verifyRelease({ ...options, sourceCommit: "b".repeat(40) }), /commit/);
    await writeFile(resolve(options.directory, "index.html"), "Changed after checks");
    await assert.rejects(() => verifyRelease(options), /integrity/);
    await prepareRelease(options);
    await writeFile(resolve(options.directory, "unexpected.txt"), "Added after checks");
    await assert.rejects(() => verifyRelease(options), /integrity/);
    await writeFile(resolve(options.directory, ".env"), "SHOULD_NOT_BE_PUBLISHED=");
    await assert.rejects(() => prepareRelease(options), /Forbidden/);
  } finally {
    if (dirname(scratch) === cache) await rm(scratch, { recursive: true, force: true });
  }
});
