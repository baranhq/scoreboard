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

The exact document root depends on your hosting provider's domain settings. A private directory must be outside **every** public document root, including the main domain's `public_html`. A sibling of a nested document root can still be publicly accessible through another domain; do not put secrets there.

Create the private directory through SSH or your hosting provider's file manager. Prefer permissions `700` on private directories and `600` on the environment file. PHP must run as a user able to read/write its private directories. If your provider uses another execution user, ask it for appropriate private ownership/group permissions; do not solve this with `777` permissions.

Set the private environment file to mode `600` (`chmod 600 /home/YOUR_ACCOUNT/scoreboard-private/.env`). The backend rejects private configuration readable by group or other users. The `.env` can contain both build settings and server settings, but build a frontend with only the needed public values where possible. Never prefix a secret with `NEXT_PUBLIC_`.

## Backend configuration

Use a maintained PHP branch with current security patches. At the time of this audit, the PHP security fixes require at least 8.3.36, 8.4.27 or 8.5.12 on the corresponding branch. Check both the web PHP runtime and the CLI interpreter used by cron/SSH; do not rely on a shared-hosting control-panel label alone. The Docker runtime is pinned to PHP 8.4.27. Update that patch tag and rebuild when PHP publishes later security releases.

Copy `.env.example` to the private `.env` and supply at least:

```dotenv
APP_ORIGIN=https://scoreboard.example.org
NEXT_PUBLIC_SITE_URL=https://scoreboard.example.org
NEXT_PUBLIC_INDEXABLE=false
APP_ALLOW_HTTP=false
DB_HOST=localhost
DB_PORT=3306
DB_NAME=account_scoreboard
DB_USER=account_scoreboard
DB_PASSWORD="your own database password"
APP_KEY="generated random key"
ADMIN_USERNAME="your own username"
ADMIN_PASSWORD_HASH="generated password hash"
ADMIN_PATH=/admin
SESSION_PATH=/home/YOUR_ACCOUNT/scoreboard-private/sessions
POLICY_PATH=/home/YOUR_ACCOUNT/scoreboard-private/policies
ANALYTICS_ENABLED=false
CLOUDFLARE_ANALYTICS_TOKEN=
CLOUDFLARE_MANUAL_CONFIRMED=false
TRUSTED_PROXY_CIDRS=
```

These are placeholders, not working credentials. Generate `APP_KEY` and `ADMIN_PASSWORD_HASH` with `backend/manage.php`. Supply the actual database names your host creates. Values may be quoted; literal password hashes must retain their `$` characters. Docker Compose `.env` files should use single quotes for hashes. The PHP reader supports those quotes too.

The production build automatically checks `$HOME/scoreboard-private/.env` and then the sibling `../scoreboard-private/.env`. Keep this file outside every document root and set its permissions to `600`. It loads the file before generating the frontend and Apache configuration; no variables need to be prefixed to `npm run build`. With no external file, `ADMIN_PATH` defaults to `/admin`, `NEXT_PUBLIC_SITE_URL` defaults to `https://scoreboard.baranhq.com`, and indexing defaults off. Existing environment variables and project `.env.local` values remain supported; process environment values take precedence.

For shared hosting, run the build from the source checkout using the same account that owns the private file:

```sh
npm ci
npm run build
```

To customize the administrator URL, set the same single-segment path in the private `.env` and PHP configuration, for example `ADMIN_PATH=/baranhq_admin`. The build writes that route into `.htaccess` and generates matching public metadata. Keep `ADMIN_PATH`, `APP_ORIGIN`, and `NEXT_PUBLIC_SITE_URL` consistent with the backend and real site. The path is not a security control: the server still requires the configured administrator username and password. The previous route stops working after the new build is deployed.

When the build discovers the external `.env`, it automatically writes `SetEnv SCOREBOARD_ENV_FILE /home/YOUR_ACCOUNT/scoreboard-private/.env` into the generated `.htaccess`. If `APACHE_ENV_FILE` is already set in the build environment or file, that value is preserved. Upload the complete `out/` contents, including `.htaccess` and `api/`; this retains the private config pointer and the PHP backend files. The pointer exposes only a filesystem path, never the file contents. If PHP-FPM does not receive `SetEnv` values on your provider, configure `SCOREBOARD_ENV_FILE` once in the PHP environment instead. Do not move the environment file into the public directory as a workaround.

Keep the private directory and `.env` at a stable account-level path when replacing the built site. If you change the domain's document root, point it at the public build only and make sure PHP still receives the same absolute private config path. Never point the document root at the account home or a parent containing private files. If `/admin` returns the generic “Request unavailable” response after a move, the web PHP process is not loading a valid private configuration (or cannot reach the database); the CLI `manage.php check` alone does not verify the web server's environment.

Check the CLI interpreter:

```sh
php --version
php -m
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php check
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php migrate
```

The password-setup command uses a hidden prompt in an interactive Linux SSH terminal. It requires POSIX terminal support. `migrate` is repeatable: applied migrations are recorded in `schema_migrations`, and the initial migration preserves existing tables. Back up before upgrades. Keep migration source files in the source checkout; they are not exposed by the deployed website.

## Hourly cleanup on shared hosting

In your hosting provider's scheduled-task settings, run the command once per hour. Use the account's real PHP CLI path. Example:

```cron
17 * * * * SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env /usr/local/bin/php /home/YOUR_ACCOUNT/scoreboard-source/backend/manage.php cleanup >> /home/YOUR_ACCOUNT/scoreboard-private/cleanup.log 2>&1
```

Run that command manually first. Verify successful runs and arrange cron failure notifications. Rotate the private log. Cleanup must run without website visits. It removes expired analytics and 15-minute login counters and prunes old session files. Queries exclude expired analytics even before physical cleanup. Do not claim retention is operational until the scheduled job has actually run on your host.

## HTTPS, routing and caches

- Enable HTTPS with your provider. Redirect HTTP to HTTPS at the hosting account/proxy level. Keep `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` equal to the public HTTPS origin.
- For a public instance intended to be indexed, set `NEXT_PUBLIC_INDEXABLE=true` and the real `NEXT_PUBLIC_SITE_URL` in the external `.env` (or the build environment) before running `npm run build`. Staging builds should remain non-indexable. After upload, follow the [search-engine setup checklist](SEO.md).
- Upload `.htaccess`; File Manager may hide dotfiles by default. Apache must allow `mod_rewrite`, `mod_headers` and the supplied override directives.
- Unknown pages return a real not-found status and the friendly custom page. Only the configured `ADMIN_PATH` serves the administrator interface.
- Bypass CDN/shared caches for the configured administrator path, `/api/*` and the server-rendered privacy-policy routes. Never cache responses with admin or preference cookies. Static hashed assets can be cached normally.
- Preserve the project's source directory outside the document root. Deploy the build from the same public Git revision used in production.

## Trusted reverse proxies

Leave `TRUSTED_PROXY_CIDRS` empty for direct hosting. The application then ignores forwarded IP headers.

For a Cloudflare-proxied origin, add only the [current official Cloudflare CIDRs](https://www.cloudflare.com/ips/) after confirming the actual connection addresses your hosting setup presents. Restrict direct origin access where your provider supports it. The application reads `CF-Connecting-IP` only when `REMOTE_ADDR` is in that explicitly trusted list. Never use `0.0.0.0/0`, `::/0`, or arbitrary client-supplied headers as a trust shortcut.

For Docker's optional Caddy proxy, the dedicated internal network is trusted and Caddy overwrites the connection-address header. With another proxy, overwrite that header and trust only the proxy's actual private address range. If Cloudflare sits in front of your own Caddy proxy, configure and verify that whole chain before relying on real-client address handling. Application analytics still never retain visitor IPs; request addresses are used only for security rate limits.

Login attempts are limited to five per client address per 15-minute window. Public API traffic is limited to 2,400 requests per address per 15 minutes, with consent changes capped at 300 in that window. The database stores only purpose-separated keyed hashes of the address in a separate security counter table; it does not store raw IPs there. A counter becomes inactive after 15 minutes and is physically deleted by hourly cleanup; if cleanup fails, the expired row remains until a later successful run. There is no global login counter, so traffic from unrelated addresses cannot lock out every administrator. These application limits reduce single-source abuse; they are not DDoS protection. If PHP cannot establish a trustworthy client address, application rate limiting fails open rather than grouping all visitors into a global lockout; configure edge/provider protections for that deployment.

The configured database account is scoped to the Scoreboard database, never global server privileges. Runtime queries need data access; `manage.php migrate` also needs schema privileges on that database. Where the host permits it, revoke schema-changing privileges between upgrades and grant them temporarily for migrations. The current configuration uses one database identity for both runtime and CLI migrations, so a separate migration account is not yet supported.

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
