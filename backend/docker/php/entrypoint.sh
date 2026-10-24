#!/bin/sh
set -e

# app and queue share the vendor volume and both run this entrypoint, so the
# composer install/migrate below must be serialized or the two containers'
# concurrent writes can corrupt the shared vendor directory.
(
    flock -w 300 9

    if [ ! -f vendor/autoload.php ]; then
        composer install --no-interaction --no-progress
    fi

    if [ ! -f .env ]; then
        cp .env.example .env
    fi

    if ! grep -q "^APP_KEY=base64:" .env; then
        php artisan key:generate --force
    fi

    php artisan migrate --force
) 9>storage/framework/docker-setup.lock

exec "$@"
