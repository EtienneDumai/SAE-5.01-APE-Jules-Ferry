#!/bin/sh
set -e

echo "Waiting for database..."

until php -r "
try {
    new PDO('pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_DATABASE', '$DB_USERNAME', '$DB_PASSWORD');
    echo 'DB OK';
} catch (Exception \$e) {
    exit(1);
}
"; do
    echo "Database not ready..."
    sleep 2
done

echo "Running migrations..."
php artisan migrate --force

echo "storage link"
php artisan storage:link

echo "optimizing"
php artisan optimize

echo "Starting php-fpm..."
php-fpm