FROM php:8.2-cli

# Install paquets système + extensions PHP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    && docker-php-ext-install pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Installer les dépendances (premier passage pour le cache)
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist || true

# Copier le reste du code
COPY . .

# Réinstaller proprement avec tout le code présent
RUN composer install --no-dev --no-interaction --prefer-dist

# Laravel écoute sur 8000 via artisan serve
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
