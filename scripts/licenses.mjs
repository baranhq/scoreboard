import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const lockText = readFileSync("package-lock.json", "utf8");
const lock = JSON.parse(lockText);
const manifestPath = ".next/client-license-modules.json";
if (!existsSync(manifestPath))
  throw new Error("Run npm run build to collect browser modules first.");
const manifest = readJson(manifestPath);
if (manifest.lockHash !== createHash("sha256").update(lockText).digest("hex"))
  throw new Error("Browser licence inventory is stale. Run npm run build.");

const allowed = new Set([
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "MPL-2.0",
  "CC-BY-4.0",
  "OFL-1.1",
  "LGPL-3.0-or-later",
  "0BSD",
  "CC0-1.0",
  "BlueOak-1.0.0",
]);
function checkLicense(name, license) {
  const identifiers = license?.replace(/[()]/g, "").split(/\s+(?:AND|OR)\s+/);
  if (!identifiers?.length || identifiers.some((id) => !allowed.has(id)))
    throw new Error(`Review licence for ${name}: ${license}`);
}
function packageDirectory(resource) {
  const normalized = resource.replaceAll("\\", "/");
  const start = normalized.lastIndexOf("node_modules/");
  if (start < 0 || normalized.includes("../")) throw new Error(`Invalid module: ${resource}`);
  const parts = normalized.slice(start + 13).split("/");
  const name = parts.slice(0, parts[0].startsWith("@") ? 2 : 1).join("/");
  return normalized.slice(0, start + 13) + name;
}
function sourceUrl(pkg, name) {
  const repository = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
  const source = (repository || pkg.homepage || "")
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "");
  if (source.startsWith("https://")) return source;
  if (/^[\w.-]+\/[\w.-]+$/.test(source)) return `https://github.com/${source}`;
  return `https://www.npmjs.com/package/${name}`;
}
function collect(directory, label) {
  const files = readdirSync(directory).filter((file) =>
    /^(licen[cs]e|copying|notice)([._-].*)?$/i.test(file),
  );
  if (!files.length) throw new Error(`Missing original licence text: ${directory}`);
  return files.sort().map((file) => {
    const source = path.posix.join(directory, file);
    const text = readFileSync(source, "utf8");
    if (!text.trim() || text.includes("\u0000")) throw new Error(`Invalid notice: ${source}`);
    return { name: `${label} — ${file}`, source, text };
  });
}

const browserDirectories = new Set(manifest.resources.map(packageDirectory));
// Fonts, Tailwind's base CSS and the legacy polyfill are copied rather than imported as JS modules.
for (const directory of [
  "node_modules/@fontsource/inter",
  "node_modules/@fontsource/inter-tight",
  "node_modules/object-assign",
  "node_modules/tailwindcss",
])
  browserDirectories.add(directory);

const rows = [];
const browserRows = [];
const noticesByPackage = new Map();
for (const [directory, item] of Object.entries(lock.packages)) {
  if (!directory) continue;
  const pkgPath = `${directory}/package.json`;
  const pkg = existsSync(pkgPath) ? readJson(pkgPath) : {};
  const name = pkg.name || directory.slice(directory.lastIndexOf("node_modules/") + 13);
  const version = item.version;
  if (pkg.version && pkg.version !== version)
    throw new Error(`Installed version differs from lockfile: ${name}`);
  const license = name === "lucide-react" ? "ISC AND MIT" : pkg.license || item.license;
  checkLicense(name, license);
  const row = {
    name,
    version,
    license,
    source: sourceUrl(pkg, name),
    browser: browserDirectories.has(directory),
  };
  rows.push(row);
  if (row.browser) {
    if (!pkg.name) throw new Error(`Browser dependency is not installed: ${directory}`);
    noticesByPackage.set(`${name}@${version}`, collect(directory, `${name}@${version}`));
    browserRows.push(row);
    browserDirectories.delete(directory);
  }
}
if (browserDirectories.size)
  throw new Error(
    `Browser modules are missing from lockfile: ${[...browserDirectories].join(", ")}`,
  );

const next = browserRows.find((row) => row.name === "next");
if (!next) throw new Error("Next.js is missing from the browser inventory.");
const bundledDirectories = new Set();
for (const resource of manifest.resources) {
  const match = /^node_modules\/next\/dist\/compiled\/((?:@[^/]+\/)?[^/]+)/.exec(resource);
  if (match) bundledDirectories.add(`node_modules/next/dist/compiled/${match[1]}`);
}
// Webpack's generated runtime is emitted without a module.resource of its own.
bundledDirectories.add("node_modules/next/dist/compiled/webpack");
const nextNotices = noticesByPackage.get(`next@${next.version}`);
for (const directory of [...bundledDirectories].sort())
  nextNotices.push(
    ...collect(directory, `Next.js bundled ${directory.split("dist/compiled/")[1]}`),
  );

const polyfills = readJson("third-party/next/polyfills.json");
const polyfillFile = "node_modules/next/dist/build/polyfills/polyfill-nomodule.js";
if (
  createHash("sha256").update(readFileSync(polyfillFile)).digest("hex") !== polyfills.polyfillSha256
)
  throw new Error(
    "Next.js legacy polyfill changed. Review its upstream dependencies and licence notices.",
  );
if (browserRows.find((row) => row.name === "object-assign")?.version !== "4.1.1")
  throw new Error("Review the object-assign version bundled in Next.js's legacy polyfill.");
for (const component of polyfills.components) {
  checkLicense(component.name, component.license);
  const row = {
    name: component.name,
    version: component.version,
    license: component.license,
    source: component.source,
    browser: true,
  };
  const text = readFileSync(component.noticeFile, "utf8");
  if (!text.trim()) throw new Error(`Missing polyfill notice: ${component.name}`);
  noticesByPackage.set(`${row.name}@${row.version}`, [
    { name: `${row.name}@${row.version} (Next.js legacy polyfill)`, source: row.source, text },
  ]);
  rows.push(row);
  browserRows.push(row);
}

browserRows.sort((a, b) => a.name.localeCompare(b.name));
mkdirSync("public/licenses", { recursive: true });
const generated = new Map();
const publicRows = [];
for (const row of browserRows) {
  const file = `${row.name.replace("@", "").replaceAll("/", "-")}-${row.version}.json`;
  row.noticePath = `/licenses/${file}`;
  const disclosure = { ...row };
  delete disclosure.browser;
  publicRows.push(disclosure);
  generated.set(
    `public/licenses/${file}`,
    JSON.stringify(
      { ...disclosure, notices: noticesByPackage.get(`${row.name}@${row.version}`) },
      null,
      2,
    ) + "\n",
  );
}
const notices = [
  ...new Map(
    browserRows
      .flatMap((row) => noticesByPackage.get(`${row.name}@${row.version}`))
      .map((notice) => [notice.source, notice]),
  ).values(),
];
const noticeGroups = new Map();
for (const notice of notices) {
  const group = noticeGroups.get(notice.text) || { names: [], sources: [], text: notice.text };
  group.names.push(notice.name);
  group.sources.push(notice.source);
  noticeGroups.set(notice.text, group);
}
const full =
  [...noticeGroups.values()]
    .map(
      (group) =>
        `${"=".repeat(72)}\n${group.names.join("; ")}\n${group.sources.join("\n")}\n${"=".repeat(72)}\n${group.text}`,
    )
    .join("\n\n") + "\n";
generated.set("THIRD-PARTY-NOTICES.txt", full);
generated.set("public/THIRD-PARTY-NOTICES.txt", full);
generated.set("public/dependencies.json", JSON.stringify(publicRows, null, 2) + "\n");

const inventory = [
  ...new Map(rows.map((row) => [`${row.name}@${row.version}`, row])).values(),
].sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
generated.set(
  "LICENSES.md",
  `# Third-party licenses

Original Baran's Scoreboard application code: MIT, Copyright (c) 2026 Baran Ahmedov. See [LICENSE](LICENSE). Third-party components retain their own licences and copyright notices; this inventory does not relicense them.

## Distributed browser code and assets

[THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) and its identical public copy contain the original notices for the emitted browser modules, copied fonts, and Next.js's legacy polyfills. The production Webpack build records the emitted module resources before pages are rendered; **npm run licenses** regenerates from that manifest and rejects a changed lockfile or polyfill. Native image tooling, server libraries, type definitions and build-only dependencies are not presented as browser distributions. No network licence lookup is needed during builds.

Inter and Inter Tight are copied byte-for-byte from Fontsource's OFL-1.1 files. Their copyright and OFL text travel with the website; using them in raster graphics does not require a font credit on those graphics. Lucide's complete licence file includes both its ISC terms and the Feather-derived icons' MIT terms. Tailwind's MIT notice covers the base styles copied into the emitted CSS. MIT, ISC, BSD and Apache notices must accompany relevant redistributed code; none requires a promotional footer. Apache NOTICE files must also be retained where supplied. The existing project credit and MIT footer are presentation choices, not additional third-party licence conditions.

The owner confirmed that the Baran's Scoreboard wordmark and S favicon are original artwork they designed. The WebP wordmarks and product-view images are repository assets; no stock-image or template provider is referenced. The social preview remains covered by the existing project licence. System fallback fonts are not distributed. The optional Cloudflare analytics beacon is loaded from the provider after consent, not copied into this repository or the static export; no Cloudflare software licence text is bundled here.

## Dependency inventory

This table audits every package entry in package-lock.json, including optional packages for other platforms, deduplicated by name and version. “Not browser-delivered” is an inventory classification, not a claim that a dependency has no licence. Installing a tool does not itself redistribute that tool in the website. Redistributing node_modules or a build-tool image requires a separate inventory of those artifacts and their bundled libraries, including any LGPL source/relinking obligations.

| Package | Version | License | Distribution | Upstream |
| --- | --- | --- | --- | --- |
${inventory.map((row) => `| ${row.name} | ${row.version} | ${row.license} | ${row.browser ? "Browser / copied asset" : "Not browser-delivered"} | ${row.source} |`).join("\n")}

## Docker and separately installed services

The following are primary components, not blanket licences for entire container images. Dockerfile and compose.yaml reference upstream images; the repository does not contain their binaries. Running a service is different from conveying an image to someone else. Commercial use of these components is permitted under their respective terms, and their use as separate services does not relicense the application under the GPL.

| Image/component | Role | Primary licence and source |
| --- | --- | --- |
| node:24-bookworm-slim | Build stage only; Node and node_modules are not copied into the runtime | [Node.js MIT and bundled notices](https://github.com/nodejs/node/blob/v24.x/LICENSE); Debian packages have separate terms |
| php:8.4.27-apache-bookworm | Runtime base | [PHP-3.01](https://github.com/php/php-src/blob/php-8.4.27/LICENSE), [Zend-2.0](https://github.com/php/php-src/blob/php-8.4.27/Zend/LICENSE), [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) and the base image's library/package licences |
| mbstring / libmbfl | Built from the PHP source archive | [LGPL-2.1](https://github.com/php/php-src/blob/php-8.4.27/ext/mbstring/libmbfl/LICENSE); preserve corresponding source and relinking rights when redistributing binaries |
| libonig-dev / Oniguruma | Runtime image package and mbstring dependency | [BSD-2-Clause](https://github.com/kkos/oniguruma/blob/master/COPYING); retain the installed package copyright files |
| mariadb:11.4 | Separate database service | [GPL-2.0](https://github.com/MariaDB/server/blob/11.4/COPYING); source obligations apply when conveying binaries, not merely communicating with the server |
| caddy:2-alpine | Optional separate HTTPS proxy | [Apache-2.0](https://github.com/caddyserver/caddy/blob/master/LICENSE); preserve notices for Caddy, its compiled modules and Alpine packages if redistributing the image |

The PHP image retains /usr/src/php.tar.xz, including its original licence files and bundled-library source; the application Dockerfile checks that the archive remains present. Debian package notices under /usr/share/doc are not removed. Caddy and MariaDB are fetched as separate upstream images, so their licence texts do not belong in the standalone website notice download. See [SELF_HOSTING.md](SELF_HOSTING.md#redistributing-container-images) before publishing images. Mutable image tags do not establish an exact image-wide software inventory.

## CI actions

The referenced build-only actions are not copied into the website: [actions/checkout](https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/LICENSE) and [actions/setup-node](https://github.com/actions/setup-node/blob/249970729cb0ef3589644e2896645e5dc5ba9c38/LICENSE) are MIT-licensed. Their own distributions retain their notices.
`,
);

const stale = readdirSync("public/licenses").filter(
  (file) => file.endsWith(".json") && !generated.has(`public/licenses/${file}`),
);
if (process.argv.includes("--check")) {
  for (const [file, text] of generated)
    if (!existsSync(file) || readFileSync(file, "utf8") !== text)
      throw new Error(`Outdated licence output: ${file}`);
  if (stale.length) throw new Error(`Unexpected notice files: ${stale.join(", ")}`);
} else {
  for (const [file, text] of generated) writeFileSync(file, text);
  for (const file of stale) unlinkSync(path.join("public/licenses", file));
}
console.log(
  `Verified ${Object.keys(lock.packages).length - 1} locked packages; ${browserRows.length} browser components, ${notices.length} original notices.`,
);
