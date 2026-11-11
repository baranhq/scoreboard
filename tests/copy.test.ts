import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import { campaignCopy } from "../src/lib/campaign-copy.ts";
import { help } from "../src/lib/help.ts";
import { homeFaq } from "../src/lib/home-faq.ts";
import { messages } from "../src/lib/i18n.ts";
import { productDetails } from "../src/lib/product-details.ts";
import { seoContent } from "../src/lib/seo-content.ts";
import { studioCopy } from "../src/lib/studio-copy.ts";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

test("user-facing English copy avoids the banned verb", async () => {
  const privacy = await readFile(new URL("../src/lib/privacy/en.md", import.meta.url), "utf8");
  const copy = [
    campaignCopy,
    help,
    homeFaq,
    messages,
    productDetails,
    seoContent,
    studioCopy,
    privacy,
  ];
  const violations = strings(copy).filter((value) => /\bcreat(?:e|ing|ed|ion)\b/i.test(value));

  assert.deepEqual(violations, []);
});
