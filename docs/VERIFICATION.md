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
