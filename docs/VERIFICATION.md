# Verification

Local verification on 2 November 2026. These checks do not certify legal compliance, complete accessibility conformance or production security.

## Completed

- TypeScript checking and PHP syntax checks (`npm run lint`).
- Production static export and PHP packaging (`npm run build`).
- Six Node regression tests: 4,096 RGB samples for button contrast, timer pause/reset, validated backups and URL snapshots, atomic IndexedDB initialisation and individual updates, GitHub reminder preferences, and European display dates. Run `npm test`; direct diagnostic execution is `node --experimental-strip-types tests/core.test.ts`.
- PHP regression checks (`npm run test:php`): IPv4/IPv6 CIDRs, forged proxy headers, anonymous/expired sessions, strict authentication flag, escaped policy markup/links and rejection of public private-storage paths.
- Local HTTP tests with a disposable MariaDB database (`tests/http-security.py`): anonymous protected operations denied; CSRF and foreign origins rejected; login and all administrator views; malformed inputs; logout; brute-force limits; authenticated policy publication with stored-XSS payloads; stale-revision rejection; all three public policy routes, and exclusion of authenticated administrators from analytics while forged session cookies do not exclude visits.
- `npm audit`: zero reported advisories in the installed dependency tree at verification time. This is not a guarantee against unknown vulnerabilities.
- Git history inspection: the pre-existing history contained one commit with only a README. No credentials were identified there. Private preview configuration and database files remain outside the repository.

The HTTP test generates temporary administrator credentials and policy storage; never point it at production. Supply a private environment file connected to a disposable, migrated database:

```bash
python3 tests/http-security.py /absolute/private/test.env
```

PHP must have PDO MySQL enabled. For a local Unix socket, set `TEST_MYSQL_SOCKET`.

## Browser checks

The public preview was checked at widths 375, 768, 1024 and 1440px. No document-level horizontal overflow was observed; the navbar remained 64px tall. The admin sign-in, authenticated sidebar/dashboard and mobile navigation were inspected. These are targeted checks, not a complete visual or WCAG audit.

## Deployment checks still required

No production hosting account was accessed or deployed. Docker is not available in this development environment, so the Compose installation has not been executed. Verify Docker/cPanel installation, Apache `.htaccess` behaviour, production HTTPS and Secure cookies, current proxy CIDRs and header overwriting, automatic Cloudflare beacon injection being disabled, cron execution, backup restoration, hosting/AWStats retention, and public deployment provenance on the actual host.

Provider-specific log retention, processor arrangements and international-transfer details must be confirmed by the operator before publishing a final site-specific privacy notice. The general self-hosting template explicitly identifies these deployment facts rather than inventing them.

No production penetration test, comprehensive WCAG audit or measured Core Web Vitals assessment has been performed.
