import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rows = JSON.parse(readFileSync("public/dependencies.json", "utf8")) as {
  name: string;
  license: string;
  noticePath: string;
}[];
const notices = readFileSync("public/THIRD-PARTY-NOTICES.txt", "utf8");

test("browser notices cover the bundled legacy polyfills", () => {
  for (const name of ["core-js", "whatwg-fetch", "object-assign"])
    assert.ok(
      rows.some((row) => row.name === name),
      name,
    );
  assert.match(notices, /Copyright \(c\) 2014-2024 Denis Pushkarev/);
  assert.match(notices, /Copyright \(c\) 2014-2016 GitHub, Inc\./);
});

test("server and build tools are not described as browser distributions", () => {
  for (const row of rows)
    assert.doesNotMatch(row.name, /^(?:@img\/|@next\/swc-|@types\/|sharp$|PHP Docker|postcss$)/);
});

test("icon and font notices preserve their upstream terms and credits", () => {
  assert.equal(rows.find((row) => row.name === "lucide-react")?.license, "ISC AND MIT");
  assert.ok(notices.includes(readFileSync("node_modules/lucide-react/LICENSE", "utf8")));
  for (const family of ["inter", "inter-tight"])
    assert.ok(notices.includes(readFileSync(`node_modules/@fontsource/${family}/LICENSE`, "utf8")));
  for (const row of rows) {
    const disclosure = JSON.parse(readFileSync(`public${row.noticePath}`, "utf8"));
    assert.ok(disclosure.notices.length > 0, row.name);
  }
});

test("copied Tailwind base styles retain their MIT notice", () => {
  assert.ok(rows.some((row) => row.name === "tailwindcss"));
  assert.ok(notices.includes(readFileSync("node_modules/tailwindcss/LICENSE", "utf8")));
});

test("the deployed project licence remains the owner's exact MIT text", () => {
  assert.equal(readFileSync("public/LICENSE.txt", "utf8"), readFileSync("LICENSE", "utf8"));
});

test("the generator rejects stale inventory, unknown licences and missing notice text", () => {
  const root = mkdtempSync(path.join(tmpdir(), "scoreboard-licenses-"));
  const script = fileURLToPath(new URL("../scripts/licenses.mjs", import.meta.url));
  mkdirSync(path.join(root, ".next"));
  mkdirSync(path.join(root, "node_modules/example"), { recursive: true });
  const lock = JSON.stringify({
    packages: { "node_modules/example": { version: "1.0.0", license: "UNLICENSED" } },
  });
  writeFileSync(path.join(root, "package-lock.json"), lock);
  const manifest = path.join(root, ".next/client-license-modules.json");
  const run = () => spawnSync(process.execPath, [script], { cwd: root, encoding: "utf8" });
  try {
    writeFileSync(manifest, JSON.stringify({ lockHash: "old", resources: [] }));
    const stale = run();
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /inventory is stale/);
    writeFileSync(
      manifest,
      JSON.stringify({
        lockHash: createHash("sha256").update(lock).digest("hex"),
        resources: ["node_modules/example/index.js"],
      }),
    );
    const unknown = run();
    assert.notEqual(unknown.status, 0);
    assert.match(unknown.stderr, /Review licence for example: UNLICENSED/);
    writeFileSync(
      path.join(root, "node_modules/example/package.json"),
      JSON.stringify({ name: "example", version: "1.0.0", license: "MIT" }),
    );
    const missing = run();
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /Missing original licence text/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
