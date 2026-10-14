FROM php:8.5-cli

RUN apt-get update && apt-get install -y git unzip curl libzip-dev libpng-dev libicu-dev \
    && docker-php-ext-install pdo_mysql zip gd intl bcmath pcntl \
    && rm -rf /var/lib/apt/lists/*

# Node 22 + npm, copied from the official Node image
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && node -v && npm -v

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

ARG VITE_APP_NAME="SAPA PBJ"
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER=ap1
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY \
    VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && npm ci && npm run build && rm -rf node_modules \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-start.sh /docker-start.sh
RUN chmod +x /docker-start.sh

EXPOSE 10000
CMD ["/docker-start.sh"]