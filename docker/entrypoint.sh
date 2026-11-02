#!/bin/sh
set -eu
if [ "${1:-}" = "apache2-foreground" ]; then
    php /opt/scoreboard/backend/manage.php check
    php /opt/scoreboard/backend/manage.php migrate
    mkdir -p /var/lib/scoreboard/sessions /var/lib/scoreboard/policies
    chown -R www-data:www-data /var/lib/scoreboard/sessions /var/lib/scoreboard/policies
fi
exec docker-php-entrypoint "$@"
