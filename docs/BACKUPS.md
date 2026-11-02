# Backup and recovery

Browser games and server records are different. A server backup cannot recover games that never left a visitor's browser.

## Games

Use the backup menu on Saved games to export all games, or the entry actions menu to export one. Keep the JSON somewhere you control. Imports validate IDs, names, scores, colours, icons, appearance and timers; imported games get fresh IDs and never silently replace existing records.

Snapshot links are convenient for sharing small games, but messaging applications may truncate long URLs. Keep JSON backups for important or large games. Links are not encrypted or access-controlled and do not synchronise edits.

## Shared hosting

In phpMyAdmin, select only the application's database and use Export → SQL. Save it outside the website and source checkout. Copy the private `.env` and policy directory to protected storage too. You can alternatively use the CLI; `-p` prompts rather than placing a password in the command:

```sh
mysqldump -h localhost -u YOUR_DATABASE_USER -p --single-transaction YOUR_DATABASE_NAME > /home/YOUR_ACCOUNT/scoreboard-private/backup.sql
```

Protect and expire backups according to your actual retention plan. Do not retain indefinite copies of optional visitor analytics. If backups include records already deleted from live storage, disclose the actual backup expiry and restrict access. The application cannot delete copies retained by a hosting provider; confirm those arrangements separately.

To restore during maintenance, with public access blocked by your normal hosting maintenance controls:

```sh
mysql -h localhost -u YOUR_DATABASE_USER -p YOUR_DATABASE_NAME < /home/YOUR_ACCOUNT/scoreboard-private/backup.sql
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php migrate
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php disable-consents
SCOREBOARD_ENV_FILE=/home/YOUR_ACCOUNT/scoreboard-private/.env php backend/manage.php cleanup
```

`disable-consents` intentionally removes restored optional analytics and resets restored usage/Cloudflare permissions. This avoids resurrecting deleted visitor records or outdated consent after a database rollback. It does not affect browser games or published privacy documents. Remove restored admin session files to require fresh sign-in before reopening the site. Restore the private policy directory if needed, preserving its private permissions.

## Docker

For a database export, use the database user's interactive password prompt:

```sh
docker compose exec database mariadb-dump -u YOUR_DATABASE_USER -p --single-transaction YOUR_DATABASE_NAME > backup.sql
```

Keep the export outside Git and public directories. Back up the `policies` volume and your private `.env`. Do not treat containers as storage: persistent named volumes hold the data.

Restore during maintenance using an interactive database client, then run the same migration, consent-reset and cleanup commands inside the app container:

```sh
docker compose exec app php /opt/scoreboard/backend/manage.php migrate
docker compose exec app php /opt/scoreboard/backend/manage.php disable-consents
docker compose exec app php /opt/scoreboard/backend/manage.php cleanup
```

Never restore a database and make it public before expiring restored analytics and resetting optional permissions. Validate your own restore procedure on an isolated instance. Copying private backups to a public repository is never part of deployment.
