import { test } from "node:test";
import assert from "node:assert/strict";
import { campaignCopy } from "../src/lib/campaign-copy.ts";
import { help } from "../src/lib/help.ts";
import { homeFaq } from "../src/lib/home-faq.ts";
import { messages } from "../src/lib/i18n.ts";
import { landingContent } from "../src/lib/landing-content.ts";
import { productDetails } from "../src/lib/product-details.ts";
import { seoContent } from "../src/lib/seo-content.ts";
import { studioCopy } from "../src/lib/studio-copy.ts";

const locales = ["en", "bg", "tr"] as const;

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function stringEntries(value: unknown, path = ""): Map<string, string> {
  if (typeof value === "string") return new Map([[path, value]]);
  if (Array.isArray(value)) {
    return new Map(value.flatMap((entry, index) => [...stringEntries(entry, `${path}[${index}]`)]));
  }
  if (value && typeof value === "object") {
    return new Map(
      Object.entries(value).flatMap(([key, entry]) => [
        ...stringEntries(entry, path ? `${path}.${key}` : key),
      ]),
    );
  }
  return new Map();
}

const localizedCatalogues = {
  campaignCopy,
  help,
  homeFaq,
  landingContent,
  messages,
  productDetails,
  seoContent,
  studioCopy,
};

test("user-facing copy avoids generic create wording in each language", () => {
  const forbiddenWords = {
    en: /\bcreat(?:e|es|ed|ing|ion)\b/i,
    bg: /създа\p{L}*/iu,
    tr: /oluştur\p{L}*/iu,
  };

  for (const [name, catalogue] of Object.entries(localizedCatalogues)) {
    for (const locale of locales) {
      const violations = strings(catalogue[locale]).filter((value) =>
        forbiddenWords[locale].test(value),
      );
      assert.deepEqual(violations, [], `${name}/${locale}`);
    }
  }
});

test("localised catalogues have matching strings and interpolation tokens", () => {
  for (const [name, catalogue] of Object.entries(localizedCatalogues)) {
    const reference = stringEntries(catalogue.en);

    for (const locale of locales.filter((locale) => locale !== "en")) {
      const translated = stringEntries(catalogue[locale]);
      assert.deepEqual(
        [...translated.keys()].sort(),
        [...reference.keys()].sort(),
        `${name}/${locale}`,
      );

      for (const [path, english] of reference) {
        const tokens = (text: string) =>
          [...text.matchAll(/\{[^}]+\}/g)].map(([token]) => token).sort();
        assert.deepEqual(
          tokens(translated.get(path) ?? ""),
          tokens(english),
          `${name}/${locale}/${path}`,
        );
      }
    }
  }
});
