import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("the retired exclusions migration preserves existing database records", () => {
  const migrationsUrl = new URL("../backend/migrations/", import.meta.url);
  const migrations = readdirSync(migrationsUrl);

  assert.ok(migrations.includes("002-preserve-legacy-exclusions.sql"));
  assert.ok(!migrations.includes("002-remove-network-exclusions.sql"));

  const migration = readFileSync(
    new URL("../backend/migrations/002-preserve-legacy-exclusions.sql", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE)\s+(?:TABLE|FROM)\b/i);
  assert.match(migration, /(?:^|\n)SELECT 1;\s*$/);
});
