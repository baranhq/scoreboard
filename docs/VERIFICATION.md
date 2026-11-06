# Verification

Local verification on 2 November 2026. These checks do not certify legal compliance, complete accessibility conformance or production security.

## Completed

- TypeScript checking and PHP syntax checks (`npm run lint`).
- Production static export and PHP packaging (`npm run build`).
- Six Node regression tests: 4,096 RGB samples for button contrast, timer pause/reset, validated backups and URL snapshots, atomic IndexedDB initialisation and individual updates, GitHub reminder preferences, and European display dates. Run `npm test`; direct diagnostic execution is `node --experimental-strip-types tests/core.test.ts`.
- PHP regression checks (`npm run test:php`): IPv4/IPv6 CIDRs, forged proxy headers, anonymous/expired sessions, strict authentication flag, escaped policy markup/links, rejection of public private-storage paths and symlinked paths, private configuration permissions, and HTTPS cookie configuration.
- The existing disposable MariaDB HTTP suite covers anonymous protected operations, CSRF/origin checks, login and admin views, malformed inputs, logout, throttling, policy XSS/revision handling and analytics exclusions. This pass added assertions for per-address login/API limits; they could not be run here because the PHP installation has no PDO drivers. The suite requires a disposable MySQL/MariaDB database and must not target production.
- `npm audit --audit-level=high` was attempted, but DNS resolution for `registry.npmjs.org` failed. No complete npm advisory-feed result is available for this pass. Installed Next.js 16.4.4, React 19.3.1 and Sharp 0.35.5 were checked against the upstream notices linked in the security report; this does not replace a fresh lockfile-wide audit.
- A high-confidence credential-pattern scan covered the tracked working tree and all four Git commits; it found no matching private-key or common cloud/GitHub/GitLab/Slack token signatures. This heuristic cannot detect every secret format.
- Git history inspection: the pre-existing history contained one commit with only a README. No credentials were identified there. Private preview configuration and database files remain outside the repository.

The HTTP test generates temporary administrator credentials and policy storage; never point it at production. Supply a private environment file connected to a disposable, migrated database:

```bash
python3 tests/http-security.py /absolute/private/test.env
```

PHP must have PDO MySQL enabled. For a local Unix socket, set `TEST_MYSQL_SOCKET`.

## Browser checks

The public preview was checked at widths 375, 768, 1024 and 1440px. No document-level horizontal overflow was observed; the navbar remained 64px tall. The admin sign-in, authenticated sidebar/dashboard and mobile navigation were inspected. These are targeted checks, not a complete visual or WCAG audit.

## Deployment checks still required

No production hosting account was accessed or deployed. Docker and Apache CLIs are unavailable in this development environment, so the Compose installation, pinned PHP image and Apache `.htaccess` behaviour have not been executed here. Verify the actual web and CLI PHP versions (8.3.36+, 8.4.27+ or 8.5.12+ at this audit date), production HTTPS and Secure cookies, current proxy CIDRs and header overwriting, automatic Cloudflare beacon injection being disabled, scheduled cleanup, backup restoration, hosting/AWStats retention, and public deployment provenance on the actual host.

Provider-specific log retention, processor arrangements and international-transfer details must be confirmed by the operator before publishing a final site-specific privacy notice. The general self-hosting template explicitly identifies these deployment facts rather than inventing them.

No production penetration test, comprehensive WCAG audit or measured Core Web Vitals assessment has been performed.

## Performance and SEO comparison — 6 November 2026

The production static export was built before and after the frame split. Both builds completed; the updated build prerendered 30 pages. The table compares the homepage and English scoreboard HTML plus local JavaScript referenced by script tags. Each file was gzipped separately at level 9, so these are repeatable size estimates rather than observed CDN transfer sizes.

| Route             | JS raw / gzip, before → after             | HTML raw / gzip, before → after         | HTML + JS gzip sum, before → after     |
| ----------------- | ----------------------------------------- | --------------------------------------- | -------------------------------------- |
| `/`               | 642,140 / 199,161 B → 638,427 / 198,127 B | 117,395 / 20,444 B → 127,973 / 21,836 B | 219,605 B → 219,963 B (+358 B, 0.2%)   |
| `/en/scoreboard/` | 714,141 / 221,220 B → 675,973 / 210,544 B | 44,325 / 10,514 B → 55,099 / 11,444 B   | 231,734 B → 221,988 B (−9,746 B, 4.2%) |

The scoreboard route now ships 38,168 fewer raw JavaScript bytes (5.3%) and its HTML-plus-JavaScript gzip sum is 4.2% lower. The homepage JavaScript sum is slightly smaller, but the extra server-rendered frame markup makes its combined estimate 358 B (0.2%) larger. The homepage baseline also referenced `/theme.js`, which was absent from the export; the updated build uses the existing fingerprinted theme asset. The baseline homepage JavaScript figure therefore did not count a successful theme-script response.

These totals exclude CSS, images, fonts, HTTP headers and CDN compression. They do not measure FCP, LCP, INP, CLS, CPU time, interaction latency or memory use. No Lighthouse run, CPU/network throttling run, extended scoreboard session or physical low-end-device test was available.

The updated export was checked for 15 canonical sitemap URLs, reciprocal five-entry language sets, canonical links on the English aliases, saved-page `noindex`, parseable homepage JSON-LD, one H1 and a description on each canonical page, existing local script assets, and crawler rules for OAI-SearchBot and private paths. All checks passed. The compatibility routes `/en/` and `/scoreboard/` are intentionally absent from the sitemap and point to `/` and `/en/scoreboard/`, respectively.

The in-app browser smoke check covered the landing page at 375 px and 1440 px, a score increment, fullscreen entry and exit, and console errors/warnings. No horizontal overflow or console errors/warnings appeared in those checks. The saved-board persistence flow, reduced-motion rendering, keyboard-only journeys and full light/dark route matrix were not browser-tested in this pass; existing unit and PHP regression suites passed.

The updated source does not change privacy choices, analytics, storage, backend behavior, dependencies or licensing. No production deployment or hosting setting changed. Confirm Google-selected canonicals and crawl reports in Search Console, submit the sitemap in Google Search Console and Bing Webmaster Tools, and verify actual Apache/Cloudflare cache and compression headers after deployment. Search-volume, rankings, and field Core Web Vitals still require the relevant external tools and data.
