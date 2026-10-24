FROM php:8.5-cli

# The vite service shares this image: the Wayfinder vite plugin shells out to
# `php artisan wayfinder:generate` during `npm run dev`, so PHP and Node must
# live in the same container, not separate ones.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        curl \
        libpq-dev \
        libicu-dev \
        libzip-dev \
        libpng-dev \
    && docker-php-ext-install pdo_pgsql pgsql intl zip gd bcmath pcntl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
