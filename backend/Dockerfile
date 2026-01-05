FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    git curl libpq-dev unzip && \
    docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create app directory
WORKDIR /var/www/html

COPY . .

RUN composer install
RUN php artisan key:generate

CMD php artisan serve --host=0.0.0.0 --port=8000
