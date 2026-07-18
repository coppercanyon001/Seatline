import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Final Whistle metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Final Whistle: Spain vs Argentina<\/title>/i);
  assert.match(html, /Lead Spain against Argentina in an original 3D arcade football final/i);
});

test("documents the Mint-first football game and tutorial package", async () => {
  const [readme, packageJson, manifest] = await Promise.all([
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL("MINT_ASSET_MANIFEST.md", root), "utf8"),
  ]);

  assert.match(readme, /Final Whistle: Spain vs Argentina/);
  assert.match(readme, /Mint-first/i);
  assert.match(readme, /Open-Source Gaming Notes/);
  assert.match(packageJson, /"name": "final-whistle-spain-argentina"/);
  assert.match(packageJson, /"license": "MIT"/);
  assert.match(manifest, /Structural Validation/i);
  assert.match(manifest, /reject before final generation and pivot to solid Mint modules/i);
});
