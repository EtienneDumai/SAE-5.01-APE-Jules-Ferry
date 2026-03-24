# SAE-5.01-APE-Jules-Ferry

## Developper en mode local : 
- Activer l'extension php-pgsql dans le fichier php.ini
- Installer les dépendances du backend :
     ```bash
    cd backend \
    composer install \
    cp .env.example .env \
    php artisan key:generate \
    cd ..
    ```
- Installer les dépendances du frontend :
    ```bash
    cd frontend \
    npm install \
    cd ..
    ```
- Lancer l'application en mode developpement avec Docker : 
    ```bash
    docker-compose -f docker-compose.yml up --build
    ```
- Lancer l'application en mode production avec Docker : 
    - Copier le .env actuel dans le fichier .env.prod : 
        ```bash
        cd backend \
        cp .env .env.prod \
        cd ..
        ```
    - Lancer l'application en mode production avec Docker : 
        ```bash
        docker compose -f docker-compose.prod.yml up --build
        ```
## Deployer l'application sur le serveur de production :
- Pré-requis : 
    Avoir une clé ssh sur le serveur car le serveur refuse les connexions ssh par mot de passe
