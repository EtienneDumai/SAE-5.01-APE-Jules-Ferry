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
- Lancer le backend : 
    ```bash
    cd backend
    php artisan serve
    cd ..
    ```
- Installer les dépendances du frontend :
    ```bash
    cd frontend
    npm install
    cd ..
    ```
- Lancer le frontend : 
    ```bash
    cd frontend
    npm start
    cd ..
    ```
- Lancer la Base de Données avec Docker : 
    ```bash
    docker run --name ape-postgres -d \
    -e POSTGRES_DB=ape_db \
    -e POSTGRES_USER=ape_user \
    -e POSTGRES_PASSWORD=ape_password \
    -p 5432:5432 \
    -v ./db-data/:/var/lib/postgresql/data \
    postgres:16
    ```