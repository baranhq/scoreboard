import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { messages } from "../src/lib/i18n.ts";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("custom analytics does not dispatch or accept interaction events", () => {
  assert.equal(existsSync(new URL("../src/lib/analytics.ts", import.meta.url)), false);

  for (const path of [
    "src/components/scoreboard/scoreboard.tsx",
    "src/components/scoreboard/saved-boards.tsx",
    "src/components/layout/privacy-controls.tsx",
  ]) {
    assert.doesNotMatch(read(path), /scoreboard-event|@\/lib\/analytics|\btrack\(/, path);
  }

  const api = read("backend/analytics.php");
  assert.doesNotMatch(api, /ALLOWED_EVENTS|['"]click['"]|INSERT INTO events/i);
  assert.match(api, /if \(!valid_analytics_payload\(\$data\)\) fail\(400\)/);
  assert.match(api, /if \(\$type === 'view'\).*INSERT INTO pageviews/s);
  assert.match(api, /\$type === 'active' \? min\(15, max\(0,\$elapsed\)\)/);

  const client = read("src/components/layout/privacy-controls.tsx");
  assert.match(client, /type: "view" \| "active"/);
  assert.match(client, /send\(\{ type: "view" \}\)/);
  assert.match(client, /send\(\{ type: "active" \}\)/);

  const admin = read("backend/admin.php");
  assert.doesNotMatch(admin, /Button clicks|FROM events|\['clicks'\s*,/i);
});

test("privacy disclosures describe the current interaction-event policy in all languages", () => {
  const policies = {
    en: read("src/lib/privacy/en.md"),
    bg: read("src/lib/privacy/bg.md"),
    tr: read("src/lib/privacy/tr.md"),
  };

  assert.match(
    policies.en,
    /does not collect button clicks, link clicks, or other interaction events as separate analytics events/i,
  );
  assert.match(
    policies.bg,
    /не събира кликвания върху бутони, връзки или други отделни действия като аналитични събития/i,
  );
  assert.match(
    policies.tr,
    /düğme ve bağlantı tıklamalarını veya diğer tekil etkileşimleri ayrı analiz olayları olarak toplamaz/i,
  );

  for (const [lang, policy] of Object.entries(policies)) {
    assert.match(policy, /365/);
    assert.doesNotMatch(
      policy,
      /predefined actions|предварително определени действия|önceden tanımlanmış işlemleri/i,
      lang,
    );
  }
});

test("consent copy describes the current analytics in all languages", () => {
  const noInteractionEvents = {
    en: /does not record button clicks, link clicks or individual interactions as analytics events/i,
    bg: /не записва(?:т)? кликвания по бутони, връзки или отделни действия като аналитични събития/i,
    tr: /düğme ve bağlantı tıklamalarını veya tekil etkileşimleri analiz olayı olarak kaydetmez/i,
  };

  for (const lang of ["en", "bg", "tr"] as const) {
    assert.match(messages[lang].usageSummary, noInteractionEvents[lang], lang);
    assert.match(messages[lang].usageText, noInteractionEvents[lang], lang);
  }
});
