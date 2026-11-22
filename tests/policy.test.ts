import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { policyBlocks } from "../src/lib/policy-document.ts";
import { operator } from "../src/lib/operator.ts";

const languages = ["en", "bg", "tr"] as const;

test("all policy sections appear in each language", () => {
  for (const lang of languages) {
    const source = readFileSync(new URL(`../src/lib/privacy/${lang}.md`, import.meta.url), "utf8");
    const headings = policyBlocks(source).filter((block) => block.heading);
    assert.equal(headings.length, 9, lang);
    assert.deepEqual(
      headings.map((block) => Number(/^(\d+)\./.exec(block.text)?.[1])),
      Array.from({ length: 9 }, (_, index) => index + 1),
      lang,
    );
  }
});

test("generated policy copies match their sources and carry this revision date", () => {
  for (const lang of languages) {
    const source = readFileSync(new URL(`../src/lib/privacy/${lang}.md`, import.meta.url), "utf8")
      .trim()
      .replaceAll("Baran Ahmedov", operator.name)
      .replaceAll("baran@baranhq.com", operator.email);
    const published = JSON.parse(
      readFileSync(new URL(`../public/policies/${lang}.json`, import.meta.url), "utf8"),
    ) as { content: string; updatedAt: string };

    assert.equal(published.content, source, lang);
    assert.equal(published.updatedAt, "2026-11-22", lang);
  }
});

test("all published policies disclose retention and child-consent limits without naming vendors", () => {
  const disclosures = {
    en: {
      retention:
        /weekly incremental backups[\s\S]*Four recovery points[\s\S]*exact retention and expiry period has not been confirmed/i,
      children: /Article 25c[\s\S]*child under 14[\s\S]*no age or guardian-verification step/i,
    },
    bg: {
      retention:
        /седмични инкрементални резервни копия[\s\S]*четири точки за възстановяване[\s\S]*точният срок за съхранение и изтичане не е потвърден/i,
      children:
        /чл\. 25в[\s\S]*дете под 14 години[\s\S]*няма проверка на възраст или родителско\/настойническо разрешение/i,
    },
    tr: {
      retention:
        /haftalık artımlı yedekleme[\s\S]*dört kurtarma noktası[\s\S]*kesin saklama ve sona erme süresi doğrulanmamıştır/i,
      children:
        /25c maddesi[\s\S]*14 yaşından küçük çocuğun[\s\S]*yaş veya ebeveyn\/vasi doğrulaması yoktur/i,
    },
  };

  for (const lang of languages) {
    const published = JSON.parse(
      readFileSync(new URL(`../public/policies/${lang}.json`, import.meta.url), "utf8"),
    ) as { content: string };
    assert.match(published.content, disclosures[lang].retention, lang);
    assert.match(published.content, disclosures[lang].children, lang);
    assert.doesNotMatch(published.content, /\b(?:Cloudflare|JetHost|JetBackup|Tuta)\b/i, lang);
  }
});

test("standalone headings split paragraphs without surrounding blank lines", () => {
  assert.deepEqual(policyBlocks("First line.\r\nSecond line.\r\n## Heading\r\nBody.\r\n## Next"), [
    { heading: false, text: "First line.\nSecond line." },
    { heading: true, text: "Heading" },
    { heading: false, text: "Body." },
    { heading: true, text: "Next" },
  ]);
});

test("repeated headings stay separate and inline heading-like text remains plain", () => {
  const blocks = policyBlocks("Text ## inline.\n\n## Same <title>\n## Same <title>\nEnd.");
  assert.deepEqual(blocks, [
    { heading: false, text: "Text ## inline." },
    { heading: true, text: "Same <title>" },
    { heading: true, text: "Same <title>" },
    { heading: false, text: "End." },
  ]);
  assert.deepEqual(
    blocks.flatMap((block, index) => (block.heading ? [`policy-section-${index}`] : [])),
    ["policy-section-1", "policy-section-2"],
  );
});
