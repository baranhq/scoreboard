# Deployment guide

These instructions apply to any operator, domain and compatible hosting provider. Replace every example value. The public application is Baran's Scoreboard; you are the controller/operator of your own deployment.

## Shared hosting: directories

For an account named `YOUR_ACCOUNT`, a typical arrangement is:

```text
/home/YOUR_ACCOUNT/scoreboard-source/          source checkout, not public
/home/YOUR_ACCOUNT/scoreboard-private/.env     secrets, not public
/home/YOUR_ACCOUNT/scoreboard-private/sessions/
/home/YOUR_ACCOUNT/scoreboard-private/policies/
/home/YOUR_ACCOUNT/public_html/scoreboard/     domain's document root: contents of out/
```

The exact document root depends on cPanel Domains. A private directory must be outside **every** public document root, including the main domain's `public_html`. A sibling of a nested document root can still be publicly accessible through another domain; do not put secrets there.

Create the private directory through SSH or cPanel File Manager. Prefer permissions `700` on private directories and `600` on the environment file. PHP must run as a user able to read/write its private directories. If your provider uses another execution user, ask it for appropriate private ownership/group permissions; do not solve this with `777` permissions.

The `.env` can contain both build settings and server settings, but build a frontend with only the needed public values where possible. Never prefix a secret with `NEXT_PUBLIC_`.

## Backend configuration

Copy `.env.example` to the private `.env` and supply at least:

```dotenv
APP_ORIGIN=https://scoreboard.example.org
APP_ALLOW_HTTP=false
DB_HOST=localhost
DB_PORT=3306
DB_NAME=account_scoreboard
DB_USER=account_scoreboard
DB_PASSWORD="your own database password"
APP_KEY="generated random key"
ADMIN_USERNAME="your own username"
ADMIN_PASSWORD_HASH="generated password hash"
SESSION_PATH=/home/YOUR_ACCOUNT/scoreboard-private/sessions
POLICY_PATH=/home/YOUR_ACCOUNT/scoreboard-private/policies
ANALYTICS_ENABLED=false
CLOUDFLARE_ANALYTICS_TOKEN=
CLOUDFLARE_MANUAL_CONFIRMED=false
TRUSTED_PROXY_CIDRS=
```

These are placeholders, not working credentials. Generate `APP_KEY` and `ADMIN_PASSWORD_HASH` with `backend/manage.php`. Supply the actual database names your host creates. Values may be quoted; literal password hashes must retain their `$` characters. Docker Compose `.env` files should use single quotes for hashes. The PHP reader supports those quotes too.

Add `SetEnv SCOREBOARD_ENV_FILE /home/YOUR_ACCOUNT/scoreboard-private/.env` to the uploaded `.htaccess`. This is a deployment setting, not a source-code edit. If PHP-FPM does not receive `SetEnv` values on your provider, ask it to set `SCOREBOARD_ENV_FILE` in the PHP environment. Do not move the environment file into the public directory as a workaround.

Check the CLI interpreter:

```sh
php --version
php -m
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php check
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php migrate
```

The password-setup command uses a hidden prompt in an interactive Linux SSH terminal. It requires POSIX terminal support. `migrate` is repeatable: applied migrations are recorded in `schema_migrations`, and the initial migration preserves existing tables. Back up before upgrades. Keep migration source files in the source checkout; they are not exposed by the deployed website.

## Hourly cleanup in cPanel

In cPanel Cron Jobs, choose once per hour. Use the hosting account's real PHP CLI path. Example:

```cron
17 * * * * SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env /usr/local/bin/php /home/YOUR_ACCOUNT/scoreboard-source/backend/manage.php cleanup >> /home/YOUR_ACCOUNT/scoreboard-private/cleanup.log 2>&1
```

Run that command manually first. Verify successful runs and arrange cron failure notifications. Rotate the private log. Cleanup must run without website visits. It removes expired analytics and 15-minute login counters and prunes old session files. Queries exclude expired analytics even before physical cleanup. Do not claim retention is operational until the scheduled job has actually run on your host.

## HTTPS, routing and caches

- Enable HTTPS with your provider. Redirect HTTP to HTTPS at the hosting account/proxy level. Keep `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` equal to the public HTTPS origin.
- For a public instance intended to be indexed, set `NEXT_PUBLIC_INDEXABLE=true` and the real `NEXT_PUBLIC_SITE_URL` before building. Staging builds should remain non-indexable. After upload, follow the [search-engine setup checklist](SEO.md).
- Upload `.htaccess`; File Manager may hide dotfiles by default. Apache must allow `mod_rewrite`, `mod_headers` and the supplied override directives.
- Unknown pages return a real not-found status and the friendly custom page. `/baranhq_admin` is not served as admin.
- Bypass CDN/shared caches for `/admin`, `/api/*` and the server-rendered privacy-policy routes. Never cache responses with admin or preference cookies. Static hashed assets can be cached normally.
- Preserve the project's source directory outside the document root. Deploy the build from the same public Git revision used in production.

## Trusted reverse proxies

Leave `TRUSTED_PROXY_CIDRS` empty for direct hosting. The application then ignores forwarded IP headers.

For a Cloudflare-proxied origin, add only the [current official Cloudflare CIDRs](https://www.cloudflare.com/ips/) after confirming the actual connection addresses your hosting setup presents. Restrict direct origin access where your provider supports it. The application reads `CF-Connecting-IP` only when `REMOTE_ADDR` is in that explicitly trusted list. Never use `0.0.0.0/0`, `::/0`, or arbitrary client-supplied headers as a trust shortcut.

For Docker's optional Caddy proxy, the dedicated internal network is trusted and Caddy overwrites the connection-address header. With another proxy, overwrite that header and trust only the proxy's actual private address range. If Cloudflare sits in front of your own Caddy proxy, configure and verify that whole chain before relying on real-client address handling. Application analytics still never retain visitor IPs; proxy addresses are used only for login protection.

## Optional analytics

Keep both integrations off if you do not need them. To enable first-party usage analytics, set `ANALYTICS_ENABLED=true` in the private environment and verify that consent is enforced by the server.

For Cloudflare Web Analytics, use manual integration only. Disable automatic zone/hostname beacon injection, set the public beacon token and set `CLOUDFLARE_MANUAL_CONFIRMED=true` only after checking the real dashboard configuration. Confirm in browser network tools that the beacon is absent before consent and after rejection/withdrawal. Application code cannot prevent an upstream service from injecting its own beacon. It is not configured or verified merely by adding a token.

No game names, teams, scores, imported backups or share payloads belong in either analytics system. Incoming share fragments are consumed locally before the optional beacon is allowed to load. There is no share database or share API.

## Published privacy policies

`POLICY_PATH` holds the current document for each language and up to 20 previous revisions. It must be writable by PHP and persist across updates. Publishing uses an authenticated, CSRF-protected action, validates the language and revision, escapes text, and atomically replaces the document. A stale editing window cannot silently overwrite a newer revision.

On Apache, public privacy routes are rendered by PHP using the exported frontend template and the published document. The frontend receives the same initial document for hydration. If no policy has been published, the build's translated default is used. No HTML or executable scripts can be published through the editor's text format. Supported formatting is paragraphs, `##` headings and HTTPS/email links.

The ordinary Next.js development server previews the build defaults. Use the exported PHP preview to verify live policy publishing. Do not delete private policy files when uploading a new frontend build.

## Common problems

| Problem | Check |
| --- | --- |
| Games disappear on another device | Games are browser-local. Export/import JSON or use a snapshot link. |
| Admin/API returns unavailable | Private file path, PHP environment forwarding, PDO MySQL, database grants, migrations and private directory permissions. Detailed database errors are deliberately not sent to visitors. |
| Sign-in or privacy save is rejected | Exact `APP_ORIGIN`, HTTPS, cookies, matching host/port, and no cached backend response. Cross-origin writes are rejected. |
| Admin CSS looks old after a deployment | Upload the complete build, including current `_next` assets, then clear only appropriate static caches. Never cache admin HTML. |
| Privacy edit does not appear | Verify the PHP rewrite rules, `POLICY_PATH`, the selected language and cache bypass. A pure static host cannot publish server-side edits. |
| Root language differs from the device | Explicit language URLs are respected. `/` uses the remembered choice or Bulgarian; supported device languages can trigger a suggestion. |
| A timer is hidden after switching it off | Turning it off stops and resets it. Re-enable it from Timer. |

Container images and dependencies should be updated deliberately, followed by the same checks. No particular hosting provider's live configuration is certified by this repository.
