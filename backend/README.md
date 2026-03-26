# APE Jules Ferry App Backend

## 🏗️ Architecture des dossiers et fichiers

### Le dossier `app`
- `app` 📁 : contient toute la **logique applicative** du backend Laravel.  
  Il est organisé en sous-dossiers permettant de séparer clairement les responsabilités (HTTP, métier, données, configuration…).

## 📦 Organisation interne

### 🔁 Concerns

- `app/Concerns` 🧩 : contient des **traits réutilisables** (morceaux de logique partagée entre plusieurs classes).

👉 Permet de :
- factoriser du code commun
- éviter la duplication
- garder des classes simples

### 📚 Console

- `app/Console` 🖥️ : contient les **commandes Artisan personnalisées**.

👉 Utilisé pour :
- scripts internes
- tâches automatisées (cron)
- maintenance

### 🧠 Enums

- `app/Enums` 🔧 : contient les **énumérations PHP (types métier stricts)**.

👉 Permet de :
- remplacer les chaînes de caractères “magiques”
- sécuriser les valeurs utilisées dans l’application

### 🌐 HTTP

- `app/Http` 🌍 : gère toute la **couche HTTP** (entrée des requêtes).

#### Contenu :

- `Controllers/` 🎯 : reçoivent les requêtes et orchestrent la réponse  
- `Middleware/` 🛡️ : filtrent les requêtes (auth, sécurité, CORS…)  
- `Requests/` 📥 : valident les données entrantes  

👉 Flux global :
```
Requête → Middleware → Controller → Service → Réponse
```
