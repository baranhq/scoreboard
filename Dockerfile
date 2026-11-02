FROM node:24-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:8080
ARG NEXT_PUBLIC_INDEXABLE=false
ARG NEXT_PUBLIC_OPERATOR_NAME
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_OPERATOR_COUNTRY
ARG ADMIN_PATH=/admin
ARG INDEXNOW_KEY
ARG SOURCE_COMMIT=unrecorded
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_INDEXABLE=$NEXT_PUBLIC_INDEXABLE NEXT_PUBLIC_OPERATOR_NAME=$NEXT_PUBLIC_OPERATOR_NAME NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL NEXT_PUBLIC_OPERATOR_COUNTRY=$NEXT_PUBLIC_OPERATOR_COUNTRY ADMIN_PATH=$ADMIN_PATH INDEXNOW_KEY=$INDEXNOW_KEY SOURCE_COMMIT=$SOURCE_COMMIT
RUN npm run build

FROM php:8.4.27-apache-bookworm AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends libonig-dev && docker-php-ext-install pdo_mysql mbstring && rm -rf /var/lib/apt/lists/* && a2enmod rewrite headers && mkdir -p /var/lib/scoreboard/sessions /var/lib/scoreboard/policies && chown -R www-data:www-data /var/lib/scoreboard
COPY docker/apache.conf /etc/apache2/conf-available/scoreboard.conf
RUN a2enconf scoreboard
COPY --from=frontend /build/out/ /var/www/html/
COPY backend/ /opt/scoreboard/backend/
COPY docker/entrypoint.sh /usr/local/bin/scoreboard-entrypoint
RUN chmod 755 /usr/local/bin/scoreboard-entrypoint
ENV SESSION_PATH=/var/lib/scoreboard/sessions
ENTRYPOINT ["scoreboard-entrypoint"]
CMD ["apache2-foreground"]
