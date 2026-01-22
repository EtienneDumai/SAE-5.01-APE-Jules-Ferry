# SAE-5.01-APE-Jules-Ferry

## Developper en mode local : 
- Activer l'extension php-pgsql dans le fichier php.ini
- Installer les dépendances du backend :
     ```bash
    cd backend
    composer install
    cp .env.example .env
    php artisan key:generate
    cd ..
    ```
- Installer les dépendances du frontend :
    ```bash
    cd frontend
    npm install
    cd ..
    ```
- Lancer l'application avec docker-compose : 
```bash
docker-compose up --build
```