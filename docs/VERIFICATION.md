# Verification and production audit

Reviewed on 9 November 2026 against `origin/main` at `d756563`, on the local `chore/current-production-audit` branch. GitHub reported no open PRs; the landing, privacy-sidebar, mobile and SEO PRs are already merged. The initial older-checkout audit was preserved in a local stash before changing the base. `Archive.tar.gz` was not opened or modified. Nothing was committed, pushed, merged or deployed in this audit.

## Architecture and change impact

Next.js statically exports the English landing at `/`, Bulgarian and Turkish landings, localized scoreboard/help/legal pages and compatibility aliases. The PHP backend supplies administration, published policies and consent-based MySQL analytics on shared hosting. Games remain in IndexedDB; snapshots remain URL fragments. The existing server-rendered Frame and split client controls were preserved.

Changes affect consent synchronization, its public analytics-path allowlist, policy rendering, demo controls, a select menu, sharing capability detection and help titles. No database schema, authentication protocol, storage format, dependency version, contractual terms or production setting changed. Rollback is an ordinary code/build rollback; no data migration is required. Existing private policies can override bundled policies: publish the revised text to the active source when deploying.

## Prioritized findings

All code findings below are confirmed from the current main revision; provider questions are explicitly unresolved facts. Changes are local and reversible.

| Finding                                                                                                                       | Severity / confidence               | Evidence and affected files                                                                     | Impact and status                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Another tab could keep an initialized Cloudflare beacon after withdrawal; delayed state responses could restore stale consent | High / confirmed                    | `src/components/layout/privacy-controls.tsx`, new `src/lib/privacy-session.ts`                  | Fixed request ordering, immediate first-party pause, single beacon initialization and revocation reload; seven behavioural regressions |
| The actual English landing and scoreboard paths were rejected by analytics                                                    | Medium / confirmed                  | `backend/analytics.php`, `privacy-controls.tsx`                                                 | Fixed the fixed-path allowlist and client route selection; no new data categories                                                      |
| Rights section could disappear from policy contents when a Markdown heading had no preceding blank line                       | Medium / confirmed                  | `src/lib/policy-document.ts`, `backend/policy.php`, English/Bulgarian/Turkish policy section 10 | Fixed both parsers and tested the real policies and adjacent headings                                                                  |
| PHP privacy sidebar classes differed from React; printed policies retained navigation                                         | Medium / confirmed                  | `backend/policy.php`, `topic-navigation.tsx`, `policy-body.tsx`, `tests/security.php`           | Aligned rendering and print layout; existing sidebar and heading IDs retained                                                          |
| Demo pause control could be clipped and decorative controls could receive focus                                               | Medium / confirmed                  | `scoreboard-preview.tsx`                                                                        | Visible pause/play within reserved space, inert decoration and static fallback without IntersectionObserver                            |
| Select did not close with Escape from its trigger or when focus left                                                          | Medium / confirmed                  | `src/components/ui/select.tsx`                                                                  | Fixed keyboard dismissal and focus handling                                                                                            |
| Help titles repeated the product name                                                                                         | Low / confirmed                     | `src/lib/page-metadata.ts`, new `tests/seo-export.py`                                           | Fixed all three languages; new export checker detected the original errors                                                             |
| Sharing capability detection failed the existing hooks lint rule                                                              | Low / confirmed                     | `src/components/scoreboard/share-dialog.tsx`                                                    | Replaced effect-driven state with a hydration-safe browser capability snapshot                                                         |
| Hosting identity/retention, provider contracts/transfers and children's optional-analytics consent remain unverified          | High / unresolved operational facts | [Privacy deployment checklist](PRIVACY.md)                                                      | Operator/provider confirmation and, where needed, qualified legal review remain necessary                                              |

## Automated verification

Run from the repository root:

```sh
npm ci
npm run lint
npm test
npm run test:php
npm run build
python3 tests/seo-export.py
npm audit
```

The final lint, 25 Node test cases across three files, PHP regressions, static production build and export SEO check passed. The build generated 30 routes. The SEO checker covers 15 canonical public pages, reciprocal five-entry locale sets, canonical aliases, metadata, one H1 per page, crawlable app links, sitemap/robots, JSON-LD and static internal link targets. It is an output check, not an HTTP redirect or indexing test. It failed the pristine main build on the three duplicated help titles and passed the fixed export.

The npm advisory feed returned zero known vulnerabilities for the current lockfile. `npm ci` emitted existing ESLint 10 peer-range warnings from plugins declaring support through ESLint 9; the configured lint ran successfully. No dependencies were changed.

The high-specificity secret scan covered 172 tracked paths, 83 reachable commits and 730 unique Git blobs: zero matching private-key/GitHub/AWS/OpenAI signatures. This bounded pattern scan does not detect every possible secret or validate provider alerts.

The full `tests/http-security.py` suite was not run: no disposable MySQL/MariaDB server was available. PHP's PDO MySQL extension is installed but not loaded by default. The suite can load it and requires an explicit private configuration pointing only to a disposable migrated database:

```sh
python3 tests/http-security.py /absolute/private/test.env
```

For a local Unix socket, set `TEST_MYSQL_SOCKET`. The suite generates temporary administrator credentials and policy storage. Never target production. SQL consent deletion, authenticated analytics and the complete login/logout/CSRF/rate-limit journey still need that integration run.

## Browser verification

The local production export was inspected with the in-app browser. Checks covered landing-to-app navigation, team creation and renaming, scoring, timer start/pause, persisted state after reload, snapshot opening with fragment removal, Bulgarian language switching, fullscreen presentation entry/exit and Select Escape dismissal. Native fullscreen was unavailable in this browser; the application's presentation fallback was exercised. The native exit control restored the frame.

The preview and navigation were checked at 375, 768 and 1440 px widths, with no document-level horizontal overflow observed. The policy has 14 rendered sections in each language; the mobile rights-section anchor and desktop sticky sidebar were checked. Light and dark views were inspected, and the final tab had no captured console errors or warnings. These are targeted checks, not a complete keyboard, screen-reader, WCAG 2.2 AA or physical-device audit. Consent lifecycle acceptance/rejection/withdrawal and races are covered by the behavioural controller tests; live Cloudflare requests and database-backed consent persistence were not end-to-end tested locally.

## Performance

A pristine snapshot of the same main revision and the final branch were built with the same installed lockfile. Values below sum each page's local script-tag resources, with each file separately gzip-compressed at level 9. They exclude HTML, CSS, images, fonts, headers and actual CDN compression.

| Route             | Raw JavaScript, baseline → final | Gzip JavaScript, baseline → final |
| ----------------- | -------------------------------- | --------------------------------- |
| `/`               | 636,336 → 637,279 B              | 196,594 → 197,764 B               |
| `/en/scoreboard/` | 673,230 → 674,476 B              | 208,819 → 210,124 B               |
| `/en/privacy/`    | 600,332 → 601,444 B              | 186,780 → 188,063 B               |

The reliability fixes add approximately 1.2–1.3 kB gzip per checked route. No speed improvement is claimed. Existing demo scheduling pauses offscreen, in hidden tabs, on manual pause and under reduced motion; the fallback now remains static where visibility observation is unsupported. No Lighthouse score, low-end CPU/network measurement or field LCP/INP/CLS result was collected.

## Privacy, legal and licensing review

Only section 5's other-tabs explanation changed substantively in each privacy translation: it now states that initialized tabs reload after learning of Cloudflare consent withdrawal. The policy update date is 9 November 2026. Heading parsing, navigation styling and print handling change presentation only. First-party collection now survives valid route changes and rejects stale consent responses. No collection categories, retention periods or processor identities were added.

Active Cloudflare Web Analytics, Cloudflare network services, hosting access logs and AWStats were **not** silently made hypothetical or inactive. Their factual disclosures remain unchanged. No Terms of Service or acceptance language changed.

The review used [GDPR Articles 7 and 12–14](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng), [ePrivacy Article 5(3)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219) and [EDPB consent guidance](https://www.edpb.europa.eu/documents/guideline/guidelines-052020-on-consent-under-regulation-2016679_en). Direct CPDP retrieval failed, so a complete current Bulgarian-law sign-off was not possible. The unresolved provider, retention, international-transfer, cleanup/backups and children’s-consent facts remain in [PRIVACY.md](PRIVACY.md); they require resolution before treating the notice as final for production. No legal-compliance certification is made.

The MIT project licence and owner attribution were preserved. The build regenerated the existing licence inventory without dependency changes: 359 installed npm packages, 490 preserved notices, 27 deployed app packages and the PHP runtime notice. Actual Inter/OFL, Lucide/ISC plus Feather/MIT, Next/MIT and MPL/LGPL build-tool notices were inspected. No missing attribution or incompatible new material was identified. Build-only libvips binaries are excluded from deployment; distributing those binaries separately would require their bundled-library obligations. See [LICENSES.md](../LICENSES.md) and [THIRD-PARTY-NOTICES.txt](../THIRD-PARTY-NOTICES.txt).

## Skills and documentation cleanup

Loaded and applied: `acquire-codebase-knowledge` and `change-impact` for architecture/impact tracing; `seo-audit`, `ai-seo` and `i18n-sync` for multilingual output/intent; `security-review` and `secret-scanning`; `privacy-legal-reg-gap-analysis` and `ip-legal-oss-review`; `impeccable`, `frontend-a11y`, `performance-optimization` and `browser-qa`; `create-readme`, `docs-sync-audit` and `verification-before-completion`.

Legal practice-profile files were absent, so those skills' firm-specific approval/memo workflows were unavailable; the repository's explicit privacy/FOSS constraints and official sources governed the review. Impeccable's launcher was unavailable; its audit guidance was used directly. The i18n JSON-writing workflow does not apply to typed TypeScript messages. Codebase findings were consolidated here and in existing guides rather than adding seven overlapping architecture files.

README now explains commands, configuration, contributions and private security reporting. This document replaces outdated test counts, historical repository claims and overlapping old verification narratives. Existing hosting, backup, privacy and SEO guides serve different operational purposes and were retained. No project or user files were deleted in the final current-main change set.

## Remaining work and assessment

1. Resolve the concrete privacy/provider and children’s-consent questions above and run the disposable-database HTTP suite before release.
2. Check actual Apache/Cloudflare headers, automatic beacon injection, scheduled cleanup and backup restoration on the host. No infrastructure was changed or production test performed.
3. Existing add-team controls permit more than the backup parser's 200-team-per-board import limit; large collections also have import limits. A separate consistency fix should preserve existing oversized local boards and address export/import limits together. No storage format or production board data was changed by this audit.
4. Collect representative Lighthouse/CPU/network and real-user performance evidence; validate public indexing/canonicals in Search Console/Bing with operator access.

The checked code and static output are ready for review with improved consent integrity, policy navigation, keyboard use and SEO regression coverage. Technical SEO and AI discoverability retain useful localized HTML without ranking guarantees. Production privacy readiness and complete backend verification remain dependent on the explicit operational items above; full security or accessibility conformance is not asserted.
