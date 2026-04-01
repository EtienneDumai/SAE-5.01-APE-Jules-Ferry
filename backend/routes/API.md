# 📡 API - APE Jules Ferry - Documentation des routes

## 🔓 Routes publiques

### 🔐 Authentification

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Inscription utilisateur |
| POST | /login | Connexion utilisateur (limité à 10 req/min) |
| POST | /check-email | Vérifie si un email existe |
| POST | /magic-link | Demande un lien magique |
| POST | /set-password | Définit un mot de passe |
| POST | /forgot-password | Demande de réinitialisation |
| GET | /verify-link/{id_utilisateur} | Vérifie un lien magique |

### 📧 Newsletter

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /newsletter/subscribe | Inscription à la newsletter |


### 📅 Événements

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /evenements | Liste des événements |
| GET | /evenements/{id} | Détail d’un événement |
| GET | /evenements/{id}/details | Détails complets d’un événement |


### 📰 Actualités

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /actualites | Liste des actualités |
| GET | /actualites/{id} | Détail d’une actualité |
| POST | /actualites | Créer une actualité |
| PUT | /actualites/{id} | Modifier une actualité |
| DELETE | /actualites/{id} | Supprimer une actualité |


### 📄 Formulaires

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /formulaires/{id} | Récupérer un formulaire |


### 👤 Utilisateurs

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /utilisateurs/{id} | Récupérer un utilisateur |


## 🔒 Routes protégées (auth:sanctum)

### 🔐 Authentification

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /logout | Déconnexion utilisateur |
| GET | /user | Récupérer l’utilisateur connecté |
| PATCH | /utilisateurs/{id}/mot-de-passe | Modifier le mot de passe |


### 📝 Inscriptions

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /inscriptions | Liste des inscriptions |
| POST | /inscriptions | Créer une inscription |
| GET | /inscriptions/mes-inscriptions | Mes inscriptions |
| DELETE | /inscriptions/{id_creneau} | Supprimer une inscription |


### 🛠️ Admin Inscriptions

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /admin/inscriptions | Création admin |
| PUT | /admin/inscriptions | Modification admin |
| DELETE | /admin/inscriptions | Suppression admin |


### 📅 Événements (Admin)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /evenements | Créer un événement |
| PUT | /evenements/{evenement} | Modifier un événement |
| DELETE | /evenements/{evenement} | Supprimer un événement |



### ⏱️ Créneaux

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /creneaux | Liste des créneaux |
| POST | /creneaux | Créer un créneau |
| GET | /creneaux/{id} | Détail d’un créneau |
| PUT | /creneaux/{id} | Modifier un créneau |
| DELETE | /creneaux/{id} | Supprimer un créneau |
| GET | /creneaux/tache/{tacheId} | Créneaux par tâche |


### 📄 Formulaires

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /formulaires | Liste des formulaires |
| POST | /formulaires | Créer un formulaire |
| GET | /formulaires/{id} | Détail |
| PUT | /formulaires/{id} | Modifier |
| DELETE | /formulaires/{id} | Supprimer |


### 📌 Tâches

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /taches | Liste des tâches |
| POST | /taches | Créer une tâche |
| GET | /taches/{id} | Détail |
| PUT | /taches/{id} | Modifier |
| DELETE | /taches/{id} | Supprimer |


### 👤 Utilisateurs (Admin)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /utilisateurs | Liste des utilisateurs |
| POST | /utilisateurs | Créer un utilisateur |
| GET | /utilisateurs/{id} | Détail |
| PUT | /utilisateurs/{id} | Modifier |
| DELETE | /utilisateurs/{id} | Supprimer |


### 📧 Newsletters (Admin)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /newsletters | Créer une newsletter |
| GET | /newsletters | Liste des newsletters |
| DELETE | /newsletters/{id} | Supprimer une newsletter |