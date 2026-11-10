import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
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
  "(MIT OR Apache-2.0)",
]);
const rows = [];
const notices = [];
const projectNotices = new Map();
const runtimeRows = [
  {
    name: "PHP Docker runtime",
    version: "8.4.27",
    license: "PHP-3.01",
    source: "https://github.com/php/php-src/tree/php-8.4.27",
    noticePath: "/licenses/php-docker-runtime-8.4.27.json",
  },
];
const runtimeNotices = [
  {
    name: "PHP Docker runtime — PHP License 3.01",
    source: "https://raw.githubusercontent.com/php/php-src/php-8.4.27/LICENSE",
    text: `--------------------------------------------------------------------
                  The PHP License, version 3.01
Copyright (c) 1999 - 2024 The PHP Group. All rights reserved.
--------------------------------------------------------------------

Redistribution and use in source and binary forms, with or without
modification, is permitted provided that the following conditions
are met:
  1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in
     the documentation and/or other materials provided with the
     distribution.
  3. The name "PHP" must not be used to endorse or promote products
     derived from this software without prior written permission. For
     written permission, please contact group@php.net.

  4. Products derived from this software may not be called "PHP", nor
     may "PHP" appear in their name, without prior written permission
     from group@php.net.  You may indicate that your software works in
     conjunction with PHP by saying "Foo for PHP" instead of calling
     it "PHP Foo" or "phpfoo"
  5. The PHP Group may publish revised and/or new versions of the
     license from time to time. Each version will be given a
     distinguishing version number.
     Once covered code has been published under a particular version
     of the license, you may always continue to use it under the terms
     of that version. You may also choose to use such covered code
     under the terms of any subsequent version of the license
     published by the PHP Group. No one other than the PHP Group has
     the right to modify the terms applicable to covered code created
     under this License.
  6. Redistributions of any form whatsoever must retain the following
     acknowledgment:
     "This product includes PHP software, freely available from
     <http://www.php.net/software/>".
THIS SOFTWARE IS PROVIDED BY THE PHP DEVELOPMENT TEAM \`\`AS IS'' AND
ANY EXPRESSED OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE PHP
DEVELOPMENT TEAM OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
--------------------------------------------------------------------

This software consists of voluntary contributions made by many
individuals on behalf of the PHP Group.

The PHP Group can be contacted via Email at group@php.net.

For more information on the PHP Group and the PHP project,
please see <http://www.php.net>.

PHP includes the Zend Engine, freely available at
<http://www.zend.com>.
`,
  },
];
function collect(directory, label, recursive = false) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (recursive) collect(file, label, true);
      continue;
    }
    if (/^(licen[cs]e|copying|notice)([._-].*)?$/i.test(entry.name)) {
      const content = readFileSync(file, "utf8");
      if (content.includes("\u0000")) throw new Error(`Non-text notice: ${file}`);
      notices.push({
        name: `${label} — ${path.relative(directory, file)}`,
        source: file,
        text: content,
      });
    }
  }
}
const mitTerms = readFileSync("node_modules/prettier/LICENSE", "utf8")
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n\n")
  .trim();
function fallbackNotice(pkg, directory, source) {
  const readme = existsSync(path.join(directory, "README.md"))
    ? readFileSync(path.join(directory, "README.md"), "utf8")
    : "";
  const section = (marker) => {
    const start = readme.indexOf(marker);
    if (start < 0) throw new Error(`Missing license section: ${pkg.name}`);
    return readme.slice(start).trim();
  };
  const notice = (text, licenseSource = source) => [
    { name: `${pkg.name}@${pkg.version}`, source: licenseSource, text },
  ];
  switch (pkg.name) {
    case "@humanfs/types":
      return notice(
        readFileSync("node_modules/typescript/LICENSE.txt", "utf8"),
        "https://www.apache.org/licenses/LICENSE-2.0.txt",
      );
    case "@types/json5":
      return notice(
        `Copyright (c) Jason Swearingen\n\n${mitTerms}`,
        "https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/json5",
      );
    case "@unrs/resolver-binding-linux-x64-gnu":
      return notice(readFileSync("node_modules/unrs-resolver/LICENSE", "utf8"));
    case "eslint-config-next":
      return notice(readFileSync("node_modules/next/license.md", "utf8"));
    case "esrecurse":
      return notice(section("### License"));
    case "imurmurhash":
      return notice(section("License (MIT)"));
    case "language-subtag-registry":
      return notice(
        section("## Credits and collaboration ##"),
        "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
      );
    case "language-tags":
      return notice(`Copyright (c) 2013, Matthew Caruana Galizia\n\n${mitTerms}`);
    case "natural-compare":
      return notice(`Copyright (c) 2012-2015 Lauri Rooden <lauri@rooden.ee>\n\n${mitTerms}`);
    case "stable-hash":
      return notice(`Copyright (c) Shu Ding\n\n${mitTerms}`);
    default:
      return [];
  }
}
for (const [directory, item] of Object.entries(lock.packages)) {
  if (!directory || !existsSync(`${directory}/package.json`)) continue;
  const pkg = JSON.parse(readFileSync(`${directory}/package.json`, "utf8"));
  const license = pkg.license || item.license;
  if (!allowed.has(license)) throw new Error(`Review license for ${pkg.name}: ${license}`);
  const source =
    typeof pkg.repository === "string"
      ? pkg.repository
      : pkg.repository?.url || pkg.homepage || `https://www.npmjs.com/package/${pkg.name}`;
  const before = notices.length;
  collect(directory, `${pkg.name}@${pkg.version}`);
  if (notices.length === before) notices.push(...fallbackNotice(pkg, directory, source));
  if (notices.length === before && pkg.name.startsWith("@img/sharp-libvips-")) {
    notices.push({
      name: `${pkg.name}@${pkg.version} — optional build-only native binary (not distributed in out or Docker runtime)`,
      source: `${directory}/README.md`,
      text:
        readFileSync(`${directory}/README.md`, "utf8") +
        "\nSource for the prebuilt bundle: https://github.com/lovell/sharp-libvips/tree/v" +
        pkg.version +
        "\nThis optional build-host tool is not included in the deployed static application. Redistribution of its native binaries requires compliance with every bundled library license, including LGPL source/relinking requirements. Obtain originals with notices from the upstream distribution; do not copy node_modules into the website or runtime image.\n",
    });
  }
  if (notices.length === before && pkg.name.startsWith("@next/"))
    notices.push({
      name: `${pkg.name}@${pkg.version}`,
      source: "node_modules/next/license.md",
      text: readFileSync("node_modules/next/license.md", "utf8"),
    });
  if (notices.length === before && pkg.name === "client-only")
    notices.push({
      name: "client-only (React marker package)",
      source: "node_modules/react/LICENSE",
      text: readFileSync("node_modules/react/LICENSE", "utf8"),
    });
  if (notices.length === before) throw new Error(`Missing license text: ${pkg.name}`);
  projectNotices.set(`${pkg.name}@${pkg.version}`, notices.slice(before));
  rows.push({
    name: pkg.name,
    version: pkg.version,
    license,
    source: source.replace(/^git\+/, "").replace(/\.git$/, ""),
    development: !!item.dev,
  });
}
// Next includes vendored tools; preserve their original notices as well.
const compiledStart = notices.length;
collect("node_modules/next/dist/compiled", "Next.js vendored software", true);
const next = rows.find((row) => row.name === "next");
if (next) projectNotices.get(`${next.name}@${next.version}`).push(...notices.slice(compiledStart));
mkdirSync("public/licenses", { recursive: true });
const deployedRows = rows
  .filter((row) => !row.development)
  .sort((a, b) => a.name.localeCompare(b.name));
const deployedFiles = new Set(
  deployedRows.map(
    (row) => `${row.name.replace("@", "").replaceAll("/", "-")}-${row.version}.json`,
  ),
);
deployedFiles.add("php-docker-runtime-8.4.27.json");
for (const file of readdirSync("public/licenses")) {
  if (file.endsWith(".json") && !deployedFiles.has(file)) {
    unlinkSync(path.join("public/licenses", file));
  }
}
for (const row of deployedRows) {
  const file = `${row.name.replace("@", "").replaceAll("/", "-")}-${row.version}.json`;
  row.noticePath = "/licenses/" + file;
  writeFileSync(
    "public/licenses/" + file,
    JSON.stringify(
      {
        name: row.name,
        version: row.version,
        license: row.license,
        source: row.source,
        notices: projectNotices.get(`${row.name}@${row.version}`),
      },
      null,
      2,
    ) + "\n",
  );
}
for (const runtime of runtimeRows) {
  const notice = runtimeNotices.filter((item) => item.name.startsWith(runtime.name));
  writeFileSync(
    `public${runtime.noticePath}`,
    JSON.stringify({ ...runtime, notices: notice }, null, 2) + "\n",
  );
}
const allNotices = [...notices, ...runtimeNotices];
const unique = [...new Map(allNotices.map((n) => [n.source, n])).values()];
const allRows = [...rows.sort((a, b) => a.name.localeCompare(b.name)), ...runtimeRows];
const overview =
  "# Third-party licenses\n\nOriginal Baran's Scoreboard application code: MIT, Copyright (c) 2026 Baran Ahmedov. See [LICENSE](LICENSE). Third-party components retain their own licenses and copyright notices. MIT permits commercial use and redistribution while retaining its notices; it does not require visible interface attribution.\n\nThis inventory is generated from the installed npm lockfile and lists the pinned PHP Docker runtime separately. Optional platform packages in the lockfile may vary by build machine. Regenerate with `npm ci && npm run licenses` on the distribution builder. Full verbatim license and copyright notices, including vendored Next.js notices and the PHP runtime notice, are in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) and deployed at `/THIRD-PARTY-NOTICES.txt`. The favicon at public/icon.png and wordmark at public/wordmark.png were supplied by the project owner for this MIT-licensed project. The original social preview image is an MIT-licensed application asset. Inter and Inter Tight static font subsets retain OFL-1.1; they are bundled with the app and are not sold separately. No remote fonts, photos, or unlicensed stock assets are used. Apache, MySQL/MariaDB, Node.js and optional Docker are separately installed runtimes; their upstream distributions carry their own notices. Docker service images retain their upstream licenses. Cloudflare is optional external performance analytics, not a required software dependency.\n\n| Package | Version | License | Upstream |\n| --- | --- | --- | --- |\n" +
  allRows.map((r) => `| ${r.name} | ${r.version} | ${r.license} | ${r.source} |`).join("\n") +
  "\n";
writeFileSync(
  "LICENSES.md",
  overview +
    "\n## CI actions\n\nThese build-only actions are referenced, not bundled into the website. Both use MIT: [actions/checkout](https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/LICENSE) at `d23441a48e516b6c34aea4fa41551a30e30af803` and [actions/setup-node](https://github.com/actions/setup-node/blob/249970729cb0ef3589644e2896645e5dc5ba9c38/LICENSE) at `249970729cb0ef3589644e2896645e5dc5ba9c38`. Their upstream distributions retain their notices.\n",
);
const full = unique
  .map((n) => `${"=".repeat(72)}\n${n.name}\n${n.source}\n${"=".repeat(72)}\n${n.text}`)
  .join("\n\n");
writeFileSync("THIRD-PARTY-NOTICES.txt", full + "\n");
mkdirSync("public", { recursive: true });
const deployedNotices = [
  ...deployedRows.flatMap((row) => projectNotices.get(`${row.name}@${row.version}`) || []),
  ...runtimeNotices,
];
const deployedUnique = [
  ...new Map(deployedNotices.map((notice) => [notice.source, notice])).values(),
];
writeFileSync(
  "public/THIRD-PARTY-NOTICES.txt",
  deployedUnique
    .map((n) => `${"=".repeat(72)}\n${n.name}\n${n.source}\n${"=".repeat(72)}\n${n.text}`)
    .join("\n\n") + "\n",
);
writeFileSync(
  "public/dependencies.json",
  JSON.stringify([...deployedRows, ...runtimeRows], null, 2) + "\n",
);
console.log(
  `Preserved ${unique.length} notices for ${rows.length} npm packages; deployed ${deployedRows.length} app packages and ${runtimeRows.length} runtime.`,
);
