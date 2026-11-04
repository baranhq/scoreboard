import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd(), process.env.npm_lifecycle_event === "predev");
const { messages } = await import("../src/lib/i18n.ts");
const { operator } = await import("../src/lib/operator.ts");
mkdirSync("public/policies", { recursive: true });
for (const lang of ["bg", "tr", "en"]) {
  const source = readFileSync("src/lib/privacy/" + lang + ".md", "utf8").trim();
  const content = source
    .replaceAll("Baran Ahmedov", operator.name)
    .replaceAll("baran@baranhq.com", operator.email);
  writeFileSync(
    "public/policies/" + lang + ".json",
    JSON.stringify(
      { title: messages[lang].privacy, content, revision: 0, updatedAt: "2026-11-04" },
      null,
      2,
    ) + "\n",
  );
}
