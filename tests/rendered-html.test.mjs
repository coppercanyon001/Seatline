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
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders Seatline NYC metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Seatline NYC — Preview Your Seat for The Odyssey<\/title>/i);
  assert.match(html, /Choose a New York theater, showtime, and seat/i);
});

test("documents the Mint-first theater preview", async () => {
  const [readme, packageJson, manifest] = await Promise.all([
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
    readFile(new URL("MINT_ASSET_MANIFEST.md", root), "utf8"),
  ]);
  assert.match(readme, /Seatline NYC/);
  assert.match(readme, /Mint-authored/i);
  assert.match(packageJson, /"name": "seatline-nyc"/);
  assert.match(packageJson, /"license": "MIT"/);
  assert.match(manifest, /Structural Validation Contract/i);
  assert.match(manifest, /Monument IMAX shell/i);
});
