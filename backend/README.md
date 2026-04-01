# APE Jules Ferry App Backend

## 🏗️ Architecture des dossiers et fichiers

### Le dossier `app`
- `app` 📁 : contient toute la **logique applicative** du backend Laravel.  
  Il est organisé en sous-dossiers permettant de séparer clairement les responsabilités (HTTP, métier, données, configuration…).

### 📦 Organisation interne

#### 🔁 Concerns

- `app/Concerns` 🧩 : contient des **traits réutilisables** (morceaux de logique partagée entre plusieurs classes).

👉 Permet de :
- factoriser du code commun
- éviter la duplication
- garder des classes simples

#### 📚 Console

- `app/Console` 🖥️ : contient les **commandes Artisan personnalisées**.

👉 Utilisé pour :
- scripts internes
- tâches automatisées
- maintenance

#### 🧠 Enums

- `app/Enums` 🔧 : contient les **énumérations PHP (types métier stricts)**.

👉 Permet de :
- remplacer les chaînes de caractères “magiques”
- sécuriser les valeurs utilisées dans l’application

#### 🌐 HTTP

- `app/Http` 🌍 : gère toute la **couche HTTP** (entrée des requêtes).

#### Contenu :

- `Controllers/Api` 🎯 : reçoivent les requêtes et orchestrent la réponse 
- `Controllers/Api/Auth` : gère toutes les requêtes concernant l'authetification sur l'application
👉 Flux global :
```
Requête → Middleware → Controller → Service → Réponse
```

## Documentation tests

La documentation des tests est diponible sur ce lien : 

[Tests backend](https://github.com/ApeJulesFerryAnglet/SAE-5.01-APE-Jules-Ferry/tree/master/backend/tests/testBackend.md) 🖥️ : Tests backend de l'application.

## Documentation base de données

La documentation de la base de données est diponible sur ce lien : 

[Base de données](https://github.com/ApeJulesFerryAnglet/SAE-5.01-APE-Jules-Ferry/tree/master/backend/database/database.md) 🖥️ : Base de données de l'application.