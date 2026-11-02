# Baran's Scoreboard

A free, open-source scoreboard for classrooms, games and competitions. No player accounts, cloud database or external analytics service is needed to keep score.

[Source code](https://github.com/baranhq/scoreboard) · [MIT License](LICENSE) · [Third-party licences](LICENSES.md)

- Multiple saved games and teams, automatic local saving, JSON backups and shareable snapshots.
- Per-game colours, icons, layouts and score increments.
- Countdown, stopwatch, match periods, timeouts and optional paused-time display.
- Fullscreen with accessible controls and a keep-visible option.
- Bulgarian, Turkish and British English; light, dark and device themes.
- Optional, consent-based site analytics and a server-authenticated administration panel.

Games are stored in **this browser's IndexedDB**, not in a cloud account. Export important games before clearing browser data or changing devices. Sharing encodes the game directly in the URL fragment after `#`; it creates no database record and does not synchronise later changes. Anyone with the link can read its contents. Large games can use JSON backups instead.

## Run locally

You need Node.js 24 LTS (or a compatible version >=22.18) and npm. PHP is needed only to preview the backend.

```sh
git clone https://github.com/baranhq/scoreboard.git
cd scoreboard
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). This preview works without a database. Optional analytics stay off if the backend is not configured. Production builds use a separate cache so they do not replace the development preview.

```sh
npm run typecheck
npm test
npm run test:php
npm run lint
npm run build
```

The deployable website is in `out/`. To preview the exported frontend with PHP routing:

```sh
npm run preview
```

PHP's built-in server is for local development, not public production hosting.

## Self-hosting

You can run Baran's Scoreboard on your own domain or subdomain without changing application source code. Install it at the **root of that domain**, rather than a URL subfolder. The frontend is a static Next.js export; the same small PHP backend is used on shared hosting and in Docker. A persistent Next.js server is not required.

Choose your setup:

| Setup | What you need |
| --- | --- |
| Scoreboard only | A static web host; build locally and upload `out/`. PHP/MySQL features are unavailable, but games, local saving, timers, sharing and backups work. |
| Shared hosting / cPanel | Apache with `.htaccess`, PHP 8.3+ with PDO MySQL, mbstring and sessions, MySQL 8+ or MariaDB 10.11+, and hourly cron. Choose supported releases; MySQL 8.4 LTS is recommended. |
| Linux VPS / dedicated server | The Docker Compose setup below, or the same PHP/Apache files with your own MySQL/MariaDB server. |
| Node.js hosting | Use Node to build the static frontend. Serve `out/` through your normal web server and route PHP requests to the same PHP backend. A Node-only host can run the frontend; it cannot execute the PHP admin backend. |

There are no default administrator credentials. Cloudflare is optional. First-party analytics and Cloudflare Web Analytics are both disabled by default.

### Configure your own instance

Copy the example before building:

```sh
cp .env.example .env.local
```

Set these **public build settings** in `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=https://scoreboard.example.org
NEXT_PUBLIC_INDEXABLE=false
NEXT_PUBLIC_OPERATOR_NAME="Your Name"
NEXT_PUBLIC_CONTACT_EMAIL=you@example.org
NEXT_PUBLIC_OPERATOR_COUNTRY="Your Country"
```

Replace the examples with real information. `NEXT_PUBLIC_SITE_URL` must be the origin only: no path, query, credentials or trailing page name. Set `NEXT_PUBLIC_INDEXABLE=true` only for the real public site. Rebuild whenever public build settings change. Anything beginning `NEXT_PUBLIC_` is public: never put passwords, keys or database credentials there.

Backend settings belong in a **private environment file outside every public directory**, or in the server's environment. `.env.example` explains every setting. The backend and frontend origins must match.

### Shared hosting / cPanel

A complete walkthrough, including file locations and troubleshooting, is in [Shared-hosting deployment](docs/DEPLOYMENT.md).

1. Create a domain/subdomain and enable HTTPS with your host's certificate tool. Point its document root at an empty directory. Keep the source checkout and private configuration outside all public document roots.
2. Create a MySQL database and database user in cPanel. Grant that user access only to this application's database. Use the full names, including any cPanel account prefix.
3. Enable the required PHP extensions. The PHP version used by cron/SSH must also have PDO MySQL.
4. Build locally or on the hosting account:

   ```sh
   npm ci
   npm run build
   ```

5. Upload **the contents of `out/`**, including its hidden `.htaccess`, into the domain's document root. Do not upload `.git`, `node_modules`, the source checkout, private environment files, logs or database backups.
6. Create a private directory, copy `.env.example` there as `.env`, and fill in `APP_ORIGIN`, `DB_*`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `APP_KEY` and private storage paths. Generate the key and password hash from an SSH terminal in the source checkout:

   ```sh
   php backend/manage.php secret
   php backend/manage.php password
   ```

   The password prompt is hidden. Copy only its resulting hash into `ADMIN_PASSWORD_HASH`; never put a raw password in the repository or a shell command. See the deployment guide for permissions and quoting.
7. Tell PHP where that private file is by adding this deployment setting to the uploaded `.htaccess`:

   ```apache
   SetEnv SCOREBOARD_ENV_FILE /home/YOUR_ACCOUNT/scoreboard-private/.env
   ```

8. Initialise the database using the same private configuration:

   ```sh
   SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php check
   SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php migrate
   ```

9. Open `https://your-domain/admin` and sign in. `/admin` is the same route in source and production. `/baranhq_admin` is not an alternative admin route.
10. Add the hourly cron job from the deployment guide. Confirm that it succeeds, including when nobody visits the site.

You can leave `ANALYTICS_ENABLED=false` permanently. Do not enable analytics before checking your privacy notice, audience, hosting settings and consent flow. If using a reverse proxy, configure only its actual trusted address ranges; never trust arbitrary incoming IP headers.

### Docker Compose on Linux

Install the free Docker Engine and Compose plugin using their official distribution instructions. Docker Desktop and paid services are not required. Docker runs the same exported frontend and PHP backend as shared hosting.

1. Clone the repository and create an ignored `.env` file:

   ```sh
   git clone https://github.com/baranhq/scoreboard.git
   cd scoreboard
   cp .env.example .env
   ```

2. In `.env`, set your domain, public operator information, `APP_ORIGIN`, `PUBLIC_HOST`, `DB_NAME`, `DB_USER` and **two different strong passwords** for `DB_PASSWORD` and `DB_ROOT_PASSWORD`. For local-only testing use `http://localhost:8080`, `APP_ALLOW_HTTP=true` and keep indexing off. For a public deployment use HTTPS and `APP_ALLOW_HTTP=false`.
3. Build the image, then generate the private key and your administrator password hash:

   ```sh
   docker compose build app
   docker compose run --rm --no-deps app php /opt/scoreboard/backend/manage.php secret
   docker compose run --rm --no-deps app php /opt/scoreboard/backend/manage.php password
   ```

4. Put the generated values in `APP_KEY` and `ADMIN_PASSWORD_HASH`, and choose `ADMIN_USERNAME`. In the Compose `.env`, put password hashes in **single quotes** to preserve `$` characters. Keep the file private.
5. Start your instance:

   ```sh
   docker compose up -d
   ```

   Local access is at [localhost:8080](http://localhost:8080). The database is not exposed on a host port. Migrations run before the app starts; the cleanup service runs hourly.
6. For a public domain, point its DNS at your server, open ports 80 and 443, set `PUBLIC_HOST` to that domain, and start the optional Caddy HTTPS proxy:

   ```sh
   docker compose --profile https up -d
   ```

   Caddy obtains and renews certificates automatically. Alternatively, keep the proxy profile off and use an existing HTTPS reverse proxy. [Deployment details](docs/DEPLOYMENT.md) explain trusted proxy handling and Cloudflare considerations.

The `database`, `sessions`, `policies` and certificate volumes preserve runtime data. **Do not run `docker compose down -v` during updates**: it deletes volumes.

## Administration and privacy

`/admin` requires server-side username/password authentication, an expiring HttpOnly session and CSRF validation. It is excluded from indexing. Its address is not a security control.

The sidebar separates recorded analytics, public pages/languages, predefined clicks, privacy-policy editing and deployment settings. It never contains players' game data. Statistics represent consented visits, not total traffic.

The Privacy Policy editor publishes one language at a time without rebuilding Next.js. Published documents and the last 20 revisions live in the private `POLICY_PATH` directory. Keep this directory across deployments and include it in backups. Restoring a policy revision is available from the editor. Editing text does not enable analytics or change the app's processing: keep every translation consistent with actual configuration. No Terms of Service are generated or edited.

| Data | Where it lives |
| --- | --- |
| Games, team names, scores, appearance and timers | Visitor's IndexedDB only |
| Shared snapshot | URL fragment chosen by the person sharing; imported into the recipient's browser |
| Theme, language and interface preferences | Visitor's local browser storage |
| Optional consented usage analytics | Your MySQL database; no visitor IP addresses or IP-derived visitor identifiers |
| Login-abuse counters | Separate security table; no raw IP storage |
| Published privacy documents | Your private policy directory; served publicly as policy text |
| Hosting access logs, AWStats, proxy/security logs | Provider/server configuration, independent of optional application analytics |

Cloudflare Web Analytics requires a separate opt-in, a configured token and confirmation that automatic injection is disabled. The core application works without it. Read [Privacy and deployment checks](docs/PRIVACY.md) before enabling optional processing.

## Backups, recovery and updates

- **Visitor games:** export JSON from Saved games. Import validates the backup and creates copies with new IDs, preserving existing games. Version 1 and 2 backups are supported.
- **Server data:** back up MySQL and the private policy/configuration directories outside the public web root. Protect these backups; never commit them. Use [Backup and recovery](docs/BACKUPS.md) for copy-and-paste commands and retention precautions.
- **Shared-host updates:** back up first, pull the source revision you want, run `npm ci`, build, run migrations, and replace the public build files. Preserve the private `.env`, database, sessions and policy directory.
- **Docker updates:** back up, pull, run `docker compose build app`, then `docker compose up -d` (include `--profile https` if used). Do not remove data volumes.
- **Browser storage:** the database remains named `scoreboard`. Changing application branding, language or deployment files does not intentionally delete it. Moving to a different origin changes browser storage; export/import before moving domains.

The public GitHub source is the production codebase. Deploy a known commit with environment-specific configuration; do not maintain a separate private implementation. Record the deployed commit and compare it to the public repository. Publishing to GitHub does not itself deploy or configure a hosting account.

## Licences and contributions

Copyright © 2026 Baran Ahmedov. Licensed under the MIT License.

You may use, copy, modify, distribute and commercially sell the original application under MIT. Retain its copyright and licence notices in copies or substantial portions. Visible website credit is not required. Baran Ahmedov retains copyright in his original contributions.

Third-party software and fonts retain their original licences and notices. [LICENSES.md](LICENSES.md), [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) and the application's Licences page document them. The optional Sharp/libvips native tooling is build-only and is not copied into the deployed static website or PHP runtime image; redistributing those binaries separately entails their own licence obligations.

Keep changes focused, preserve stored games, include relevant verification, and never commit credentials or production data. See [Verification](docs/VERIFICATION.md) for the checks run and deployment checks still required.
