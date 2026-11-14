# Platform constraints

The upgrade keeps Next.js static export, React, TypeScript, Tailwind and the optional PHP/MySQL backend. No new runtime dependencies or remote services are needed.

- Existing Scoreboard IndexedDB records, backup formats, sharing fragments and `/scoreboard/` URLs remain compatible.
- Saved scoreboards, leaderboards and tournament brackets share the versioned `scoreboard` IndexedDB library. Migration leaves existing legacy records in place; storage and export failures must be visible.
- Brackets support 2–64 participants; leaderboards support 1–100 rows and 1–10 columns. Limits keep editing and image export practical on ordinary devices.
- User input renders as text. Colours, document versions, counts and relationships are validated when reading storage.
- EN/BG/TR interfaces and public metadata stay equivalent. Editors and saved work are noindex; public introductions are indexable only in an indexable build.
- Existing analytics consent, admin authentication, legal documents and project licensing remain intact.

Required checks: `npm test`, `npm run test:php`, `npm run lint`, production build, `python3 tests/seo-export.py`, and formatting of changed files. No skipped tests or new suppression directives to obtain a pass.

Browser verification covers narrow and desktop layouts, keyboard controls, long content, local reopening, existing Scoreboard saves and PNG downloads. WCAG 2.2 AA and good Core Web Vitals are targets; report measurements only when actually collected. Lighthouse 100 is an aspiration, not an enforced or claimed result.
