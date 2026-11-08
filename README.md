<p align="center">
  <a href="https://scoreboard.baranhq.com"><img src="public/wordmark.png" alt="Baran's Scoreboard" width="340"></a>
</p>

# Baran's Scoreboard

Baran's Scoreboard is a free, open-source scoreboard for classroom activities, sports, and friendly competitions. Create teams, keep score, customise colours, and use the timer on a projector or shared screen.

[Open Scoreboard](https://scoreboard.baranhq.com/) · [Български](README.bg.md) · [Türkçe](README.tr.md)

It is **local-first**: no account is needed, and scoreboard names, teams, scores, and settings stay in each browser. Share a snapshot with a link or keep a JSON backup. Links contain the board data in the URL and do not sync later changes.

## What it includes

- Multiple teams, saved scoreboards, custom colours, layouts, and icons.
- Countdown and stopwatch timers, periods, and breaks.
- Fullscreen display with keyboard and touch controls.
- Bulgarian, Turkish, and British English; light, dark, and system themes.
- An optional PHP/MySQL administration backend for the privacy policy and consent-based analytics. Analytics are off by default; game data is never stored in that database.

## Run locally

You need Node.js 24 LTS (or a compatible version at least 22.18) and npm.

```sh
git clone https://github.com/baranhq/scoreboard.git
cd scoreboard
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). This works without PHP or a database.

The frontend uses Next.js, React, TypeScript and Tailwind CSS. Production builds export static files to `out/`; they do not require a Node.js server. The optional backend needs PHP with PDO MySQL and mbstring, plus MySQL/MariaDB. See the [deployment requirements](docs/DEPLOYMENT.md).

## Development and checks

| Command                       | Purpose                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`                 | Start the frontend development server.                                                   |
| `npm test`                    | Run TypeScript regression tests, including browser-storage and consent lifecycle checks. |
| `npm run lint`                | Run ESLint, TypeScript and PHP syntax checks.                                            |
| `npm run test:php`            | Run PHP security and policy-rendering regressions.                                       |
| `npm run build`               | Generate fonts, notices, policies, the static export and PHP deployment files.           |
| `python3 tests/seo-export.py` | Check metadata, locale links and indexing rules in the completed export.                 |
| `npm run format:check`        | Check source and documentation formatting.                                               |
| `npm run preview`             | Serve `out/` locally with PHP at `http://localhost:8080`.                                |

Run a production build before export checks or previewing. If a route was removed and type checking reports obsolete `.next` route types, rebuild to refresh them. The disposable-database HTTP suite and current verification limits are described in [verification notes](docs/VERIFICATION.md).

Configuration names and safe examples are in [`.env.example`](.env.example). `NEXT_PUBLIC_*` values appear in browser output; never put secrets in them. Set the public origin and operator details for your instance, and keep indexing disabled on private or staging copies. Analytics require explicit backend configuration and separate visitor consent. Self-hosters must adapt the privacy notice to their actual services and processing.

## Self-hosting

You can run it privately at home, on a home server/NAS, or on a rented Linux server. **You do not need to buy a domain or make the site public.** The guide explains a local-only Docker setup, optional access from your home network, a static-only setup, and shared hosting.

➡️ **[Read the self-hosting guide](SELF_HOSTING.md)**

For PHP/Apache shared hosting, keep the source checkout outside the document root and store server settings in `$HOME/scoreboard-private/.env`. Run `npm ci` and `npm run build`; the build loads that file automatically, defaults the admin URL to `/admin`, and writes the matching Apache rewrite into `out/.htaccess`. Set `ADMIN_PATH` in the private file to use a different path. Upload the complete `out/` contents. See the [deployment guide](docs/DEPLOYMENT.md) for PHP, database, and one-time hosting setup.

## Project files

- [Deployment details](docs/DEPLOYMENT.md) · [Backups and recovery](docs/BACKUPS.md) · [Privacy notes](docs/PRIVACY.md)
- [Search and discovery](docs/SEO.md) · [Verification](docs/VERIFICATION.md)
- [MIT License](LICENSE) · [Third-party licences and notices](LICENSES.md)

For a contribution, keep the change focused, explain the problem and run the relevant checks above. Include translations for user-facing changes. Report suspected vulnerabilities privately to [baran@baranhq.com](mailto:baran@baranhq.com) rather than posting exploit details in a public issue.

Copyright © 2026 Baran Ahmedov. Licensed under the MIT License.
