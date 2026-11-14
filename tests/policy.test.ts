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
    assert.equal(published.updatedAt, "2026-11-14", lang);
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

test("all policies disclose local preferences and Cloudflare beacon request processing", () => {
  const disclosures = {
    en: {
      consentBoundary:
        /application-managed analytics integrations[\s\S]*starts each one only after you save a separate choice[\s\S]*Cloudflare account settings can separately inject/i,
      storage:
        /custom tool themes[\s\S]*browser's preferred languages[\s\S]*Accept-Language[\s\S]*date when the GitHub reminder was last shown/i,
      cloudflare:
        /Downloading the beacon script[\s\S]*source IP address[\s\S]*discards that address at the nearest Cloudflare data centre[\s\S]*does not store it in its core databases or logs/i,
      preferences:
        /choices remain active for up to \*\*180 days\*\*[\s\S]*deletes the database record after \*\*365 days\*\*[\s\S]*expired records may remain until/i,
    },
    bg: {
      consentBoundary:
        /интеграции, управлявани от приложния код[\s\S]*стартира всяка от тях само след като запазите отделен избор[\s\S]*акаунта в Cloudflare могат отделно да добавят/i,
      storage:
        /персонализирани теми за инструментите[\s\S]*предпочитаните езици на браузъра[\s\S]*Accept-Language[\s\S]*датата, на която е показано напомнянето за GitHub/i,
      cloudflare:
        /Изтеглянето на скрипта[\s\S]*IP адреса на източника[\s\S]*отхвърля в най-близкия център за данни[\s\S]*основните бази данни или логове/i,
      preferences:
        /изборите остават активни до \*\*180 дни\*\*[\s\S]*изтрива записа от базата данни след \*\*365 дни\*\*[\s\S]*може да останат до изпълнението/i,
    },
    tr: {
      consentBoundary:
        /uygulama koduyla yönetilen analiz entegrasyonları[\s\S]*ancak ilgili hizmet için ayrı tercihinizi kaydettiğinizde başlatır[\s\S]*Cloudflare hesap ayarları ayrıca/i,
      storage:
        /kaydedilen özel araç temalarını ve adlarını[\s\S]*tarayıcının tercih edilen dillerini[\s\S]*Accept-Language[\s\S]*GitHub hatırlatmasının en son gösterildiği tarihi/i,
      cloudflare:
        /İşaretçi betiğinin indirilmesi[\s\S]*kaynak IP adresini[\s\S]*en yakın veri merkezinde sildiğini[\s\S]*ana veritabanlarında veya günlüklerinde saklamadığını/i,
      preferences:
        /tercihler son güncellemeden sonra en fazla \*\*180 gün\*\* etkin kalır[\s\S]*veritabanı kaydını siler[\s\S]*süresi dolan kayıtlar komut çalışana kadar depolamada kalabilir/i,
    },
  };

  for (const lang of ["en", "bg", "tr"] as const) {
    const source = readFileSync(new URL(`../src/lib/privacy/${lang}.md`, import.meta.url), "utf8");
    const published = JSON.parse(
      readFileSync(new URL(`../public/policies/${lang}.json`, import.meta.url), "utf8"),
    ) as { content: string };

    assert.match(
      source,
      disclosures[lang].consentBoundary,
      `${lang} source analytics consent disclosure`,
    );
    assert.match(source, disclosures[lang].storage, `${lang} source storage disclosure`);
    assert.match(source, disclosures[lang].cloudflare, `${lang} source Cloudflare disclosure`);
    assert.match(
      source,
      disclosures[lang].preferences,
      `${lang} source preference retention disclosure`,
    );
    assert.match(
      published.content,
      disclosures[lang].consentBoundary,
      `${lang} published analytics consent disclosure`,
    );
    assert.match(
      published.content,
      disclosures[lang].storage,
      `${lang} published storage disclosure`,
    );
    assert.match(
      published.content,
      disclosures[lang].cloudflare,
      `${lang} published Cloudflare disclosure`,
    );
    assert.match(
      published.content,
      disclosures[lang].preferences,
      `${lang} published preference retention disclosure`,
    );
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
