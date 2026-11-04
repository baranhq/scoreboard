import nextEnv from "@next/env";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), false);
const adminPath = process.env.ADMIN_PATH?.trim() || "/admin";
if (
  !/^\/[a-z0-9][a-z0-9_-]{0,63}$/.test(adminPath) ||
  ["/api", "/bg", "/en", "/tr"].includes(adminPath)
)
  throw new Error("ADMIN_PATH must be one available URL segment.");
const apacheEnvFile = process.env.APACHE_ENV_FILE?.trim() || "";
if (
  apacheEnvFile &&
  (!/^\/[A-Za-z0-9._/-]+$/.test(apacheEnvFile) || apacheEnvFile.split("/").includes(".."))
)
  throw new Error(
    "APACHE_ENV_FILE must be a simple absolute path without spaces or parent-directory segments.",
  );
mkdirSync("out/api/_lib", { recursive: true });
for (const file of ["config.php", "security.php", "analytics.php", "admin.php", "policy.php"])
  cpSync(`backend/${file}`, `out/api/_lib/${file}`);
writeFileSync("out/api/_lib/.htaccess", "Require all denied\n");
const htaccessPath = "out/.htaccess";
const htaccess = readFileSync(htaccessPath, "utf8");
if (!htaccess.includes("# ADMIN_ROUTE_REWRITE"))
  throw new Error("Missing administrator rewrite marker in public/.htaccess.");
const privateConfigRule = apacheEnvFile ? `SetEnv SCOREBOARD_ENV_FILE ${apacheEnvFile}\n` : "";
writeFileSync(
  htaccessPath,
  htaccess.replace(
    "# ADMIN_ROUTE_REWRITE",
    `${privateConfigRule}RewriteRule ^${adminPath.slice(1)}/?$ api/index.php [L]`,
  ),
);
cpSync("LICENSE", "out/LICENSE.txt");
const key = process.env.INDEXNOW_KEY || "";
if (key && !/^[A-Za-z0-9-]{8,128}$/.test(key))
  throw new Error("INDEXNOW_KEY must contain 8–128 letters, numbers or hyphens.");
if (
  key &&
  process.env.NEXT_PUBLIC_INDEXABLE === "true" &&
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")
)
  writeFileSync(`out/${key}.txt`, key + "\n", { flag: "w" });
