# Verification

Run the checks from the repository root:

```sh
npm ci
npm test
npm run test:php
npm run lint
npm run format:check
npm run build
python3 tests/seo-export.py
npm audit --audit-level=high
```

The GitHub Checks workflow runs these gates with Node.js 24. A successful local run does not establish that hosted CI or production behaves identically.

## What the checks cover

- Node tests: Scoreboard persistence/backup compatibility, large legacy backup round trips (within the existing 5,000-team total / 5MB budget), scoring colours, timers, fullscreen control rules, localized routes, consent lifecycle and policy parsing; new table operations, numeric sorting, storage isolation, document validation, all bracket sizes from 2 to 64, byes, progression invalidation and resize/reorder identities.
- PHP tests: configuration, authentication/security helpers, policy rendering and deployment boundaries. These do not replace database-backed HTTP tests.
- Production export: 45 generated routes, including 24 canonical public pages; one HTML title/H1, reciprocal hreflang, canonical URLs, robots directives, sitemap, static internal links and truthful JSON-LD. SVG accessibility titles are excluded from the HTML document-title count.
- Browser checks: tool navigation, responsive editors, saving/reopening, scoring and exported PNGs. Development-only Demo data / Worst case controls provide 100-row/10-column and 64-participant fixtures without touching saved records.

The CI dependency gate runs `npm audit --audit-level=high`; a pass at that threshold does not rule out moderate or low advisories. The lockfile pins Next.js 16.4.4, while the upstream 16.4.5 release includes fixes for multiple moderate advisories published on 3 November 2026. The production artifact is a static export, and the repository does not use Next.js route handlers, `use cache`, or image optimisation, so those advisory paths are not present in the deployed runtime. Recheck the dependency tree and production build when upgrading to a patched release. ([Next.js security advisories](https://github.com/vercel/next.js/security/advisories), [Next.js 16.4.5 release](https://github.com/vercel/next.js/releases/tag/v16.4.5))

## Limits and release checks

The complete `tests/http-security.py` suite needs a disposable migrated MySQL/MariaDB database and private test configuration. It generates test credentials and policy storage; never point it at production. PHP unit checks alone do not verify live admin login/logout, SQL consent deletion or production rate limiting.

Physical iOS/Android hardware, full screen-reader/WCAG 2.2 AA conformance, actual 200% browser zoom, Lighthouse scores and field Core Web Vitals require additional measurement. Emulated viewport checks are not hardware tests. Browser file-import testing was blocked by the file-access permission gate; parsing/validation tests still run locally.

After deployment, verify Apache/Cloudflare redirects, security/cache headers, the configurable admin path, consent rejection/withdrawal, and automatic-beacon settings. Confirm the active EN/BG/TR policy source: privately published policy overrides are not replaced by a frontend deployment. The unresolved provider/retention/minors questions remain in [Privacy notes](PRIVACY.md).

The live English homepage was eligible for indexing when checked on 10 November 2026: HTTP 200, `index, follow`, a canonical to `/`, public robots allowance and no `X-Robots-Tag`. Search Console/Bing history and selected canonicals still require operator access. Indexing and rankings are not guaranteed.
