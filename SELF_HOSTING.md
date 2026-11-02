# Self-host Baran's Scoreboard

This guide is for people who want to run their own copy, often just for themselves, their family, or a home network. **A public website, registered domain, search-engine account, Cloudflare account, or paid service is not required.**

## Choose how much to run

| Setup | What you get |
| --- | --- |
| Static files only | The scoreboard, browser-local saves, timers, sharing links, and JSON backups. No PHP, database, admin panel, or server analytics. |
| Full home or Linux server | The static app plus the PHP/MySQL admin panel and privacy-policy editor. Optional application analytics remain disabled unless you enable them. |
| Shared hosting | The same static frontend and PHP/MySQL backend. A domain is optional if your hosting provider gives you another suitable HTTPS address. Follow [the deployment guide](docs/DEPLOYMENT.md). |

Scoreboards themselves stay in each visitor's browser. The server database does **not** store team names or scores. It is used for optional consented analytics, privacy choices, and security counters. There is no account system for scoreboard users.

## Home server with Docker Compose

This is the simplest full setup for a Linux home server or a NAS that supports Docker Compose. The default binds the website to the server itself at `http://localhost:8080`; it is not exposed to your network or the internet.

### 1. Install Docker and get the project

Install Docker Engine and the Compose plugin using the official instructions for your Linux distribution. Then run:

```sh
git clone https://github.com/baranhq/scoreboard.git
cd scoreboard
cp .env.example .env
```

### 2. Set private local values

Open `.env` in a text editor. For a private, same-computer setup, set these values and choose your own strong, unique passwords:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:8080
NEXT_PUBLIC_INDEXABLE=false
APP_ORIGIN=http://localhost:8080
APP_ALLOW_HTTP=true
APP_BIND_ADDRESS=127.0.0.1
DB_NAME=scoreboard
DB_USER=scoreboard
DB_PASSWORD=replace-with-a-long-random-password
DB_ROOT_PASSWORD=choose-a-different-long-random-password
ADMIN_USERNAME=choose-your-own-username
ANALYTICS_ENABLED=false
CLOUDFLARE_ANALYTICS_TOKEN=
CLOUDFLARE_MANUAL_CONFIRMED=false
```

Set `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`, and `NEXT_PUBLIC_OPERATOR_COUNTRY` to the details for your own instance, or leave them blank if you do not want to publish contact details. These `NEXT_PUBLIC_` values go into public pages; never put secrets in them. Keep `.env` private and do not upload it to GitHub.

### 3. Build and create your admin credentials

Build the application image, generate a private application key, and create a password hash using the interactive prompt:

```sh
docker compose build app
docker compose run --rm --no-deps app php /opt/scoreboard/backend/manage.php secret
docker compose run --rm --no-deps app php /opt/scoreboard/backend/manage.php password
```

Copy the generated key into `APP_KEY` and the generated hash into `ADMIN_PASSWORD_HASH` in `.env`. Keep the hash in **single quotes** so the `$` characters are preserved. Do not put your plain administrator password in `.env` or a command.

### 4. Start Scoreboard

```sh
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080). The first start checks the configuration and applies database migrations. The separate cleanup service runs hourly. Open [http://localhost:8080/admin](http://localhost:8080/admin) to sign in and edit the privacy policy. `/admin` is protected by server-side authentication; the URL is not a security measure.

### Optional: use it from devices on your home network

This still does not require a domain or public internet access. Give the server a stable private-network address (for example, a DHCP reservation in your router), such as `192.168.1.25`. In `.env`, set the two origins to that address and choose it as the bind address:

```dotenv
NEXT_PUBLIC_SITE_URL=http://192.168.1.25:8080
APP_ORIGIN=http://192.168.1.25:8080
APP_ALLOW_HTTP=true
APP_BIND_ADDRESS=192.168.1.25
NEXT_PUBLIC_INDEXABLE=false
```

Rebuild and restart so the exported frontend and server use the same address:

```sh
docker compose build app
docker compose up -d
```

Then open `http://192.168.1.25:8080` on devices connected to your home network. Allow port 8080 through the server firewall only for that trusted network. **Do not forward this HTTP port from your router to the public internet.** HTTP does not encrypt traffic or administrator sign-in. For access away from home, use a VPN into your home network or set up HTTPS with a domain and a correctly configured reverse proxy; see [deployment security details](docs/DEPLOYMENT.md).

## Public server or VPS

The same Compose setup works on a Linux VPS. For public access, use a domain or hostname that points to the server, set `NEXT_PUBLIC_SITE_URL` and `APP_ORIGIN` to its exact HTTPS origin, set `APP_ALLOW_HTTP=false`, set `PUBLIC_HOST` to the hostname, and keep `NEXT_PUBLIC_INDEXABLE=false` unless you deliberately want a public, searchable site. Open only the ports required by your HTTPS proxy. To use the supplied Caddy proxy:

```sh
docker compose --profile https up -d
```

The proxy needs the hostname's DNS to reach the server and ports 80/443 to be reachable for certificate setup. If you do not want public access, skip this section and keep the default local-only binding.

For shared hosting, database setup, HTTPS, PHP configuration, and scheduled cleanup, use [the shared-hosting deployment guide](docs/DEPLOYMENT.md). You can build and upload the static frontend separately; a PHP/MySQL backend is only needed for administration and consent-based analytics.

## Static-only hosting

To run only the scoreboard UI, build the static export and place the contents of `out/` on any static web server:

```sh
cp .env.example .env.local
# Set NEXT_PUBLIC_SITE_URL to the address where this copy will run.
npm ci
npm run build
```

This option does not run the PHP API or admin panel. The scoreboard still works with browser storage, backup files, and URL-fragment sharing. On a home computer, you can preview the export with `npm run preview`.

## Data, backups, and updates

- Each browser stores its own scoreboards in IndexedDB. Export a JSON backup before clearing that browser's site data or moving to another device or address.
- Docker stores the database, policy revisions, sessions, and certificates in named volumes. Keep the private `.env` and protect backups.
- Follow [Backup and recovery](docs/BACKUPS.md) for server-data backup and restore commands.
- To update, back up first, pull the new source, then run `docker compose build app` and `docker compose up -d`.
- **Never run `docker compose down -v` for an update.** The `-v` option deletes persistent volumes.

Optional first-party analytics and Cloudflare Web Analytics are off by default. Scoreboards do not depend on them, and the app does not require Cloudflare or another external service for its core features. See [Privacy notes](docs/PRIVACY.md) before enabling analytics.
