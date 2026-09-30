#!/bin/sh
set -e
if [ "$RUN_SEED" = "true" ]; then
  php artisan migrate:fresh --seed --force
else
  php artisan migrate --force
fi
php artisan storage:link || true
php artisan config:cache
php artisan route:cache
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}