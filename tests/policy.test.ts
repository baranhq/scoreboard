import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { policyBlocks } from "../src/lib/policy-document.ts";

test("all policy sections, including section 10, appear in every language", () => {
  for (const lang of ["en", "bg", "tr"] as const) {
    const source = readFileSync(new URL(`../src/lib/privacy/${lang}.md`, import.meta.url), "utf8");
    const headings = policyBlocks(source).filter((block) => block.heading);
    assert.equal(headings.length, 14, lang);
    assert.deepEqual(
      headings.map((block) => Number(/^(\d+)\./.exec(block.text)?.[1])),
      Array.from({ length: 14 }, (_, index) => index + 1),
      lang,
    );
  }
});

test("published policy copies include the updated analytics disclosure in every language", () => {
  const clickDisclosure = {
    en: /does not collect button clicks, link clicks, or other interaction events as separate analytics events/i,
    bg: /не събира кликвания върху бутони, връзки или други отделни действия като аналитични събития/i,
    tr: /düğme ve bağlantı tıklamalarını veya diğer tekil etkileşimleri ayrı analiz olayları olarak toplamaz/i,
  };
  for (const lang of ["en", "bg", "tr"] as const) {
    const published = JSON.parse(
      readFileSync(new URL(`../public/policies/${lang}.json`, import.meta.url), "utf8"),
    ) as { content: string; updatedAt: string };
    assert.match(published.content, clickDisclosure[lang], lang);
    assert.equal(published.updatedAt, "2026-11-13", lang);
  }
});

test("published policies qualify cleanup timing by the hosting configuration", () => {
  const cleanupTiming = {
    en: /whether cleanup runs on schedule depends on hosting configuration/i,
    bg: /дали почистването се изпълнява по график зависи от настройките на хостинга/i,
    tr: /temizliğin düzenli çalışıp çalışmadığı hosting yapılandırmasına bağlıdır/i,
  };
  for (const lang of ["en", "bg", "tr"] as const) {
    const published = JSON.parse(
      readFileSync(new URL(`../public/policies/${lang}.json`, import.meta.url), "utf8"),
    ) as { content: string };
    assert.match(published.content, cleanupTiming[lang], lang);
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
