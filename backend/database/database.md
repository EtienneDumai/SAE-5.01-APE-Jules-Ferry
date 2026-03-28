# Documentation de la base de données (Factories, Migrations, Seeders)

## Schema relationnel de la base de données


## Organisation du dossier `database`

```text
database/
├── factories/
│   ├── AbonneNewsletterFactory.php
│   ├── ActualiteFactory.php
│   ├── CreneauFactory.php
│   ├── EvenementFactory.php
│   ├── FormulaireFactory.php
│   ├── InscriptionFactory.php
│   ├── TacheFactory.php
│   ├── UserFactory.php
│   └── UtilisateurFactory.php
│
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   ├── 0001_01_01_000002_create_jobs_table.php
│   ├── 2025_12_08_212523_create_utilisateurs_table.php
│   ├── 2025_12_08_212535_create_abonnes_newsletter.php
│   ├── 2025_12_08_212545_create_formulaires_table.php
│   ├── 2025_12_08_212556_create_actualites_table.php
│   ├── 2025_12_08_212579_create_evenements_table.php
│   ├── 2025_12_08_212602_create_taches_table.php
│   ├── 2025_12_08_212604_create_creneaux_table.php
│   ├── 2025_12_08_212909_create_inscriptions_table.php
│   ├── 2025_12_15_070121_create_personal_access_tokens_table.php
│   ├── 2026_02_06_152012_add_is_template_to_formulaires_table.php
│   └── 2026_03_25_090000_normalize_formulaire_statuses.php
│
└── seeders/
    ├── images/
    │   ├── actualites/
    │   │   ├── carnaval.jpg
    │   │   ├── fete_de_l_ecole.jpg
    │   │   ├── piscine.jpg
    │   │   └── Reunion.jpg
    │   │
    │   └── evenements/
    │       ├── Assemblee_generale.jpg
    │       ├── gateau-classique-chocolat.jpg
    │       ├── kermesse.jpg
    │       └── Musee.jpg
    │
    ├── AbonneNewsletterSeeder.php
    ├── ActualiteSeeder.php
    ├── CreneauSeeder.php
    ├── DatabaseSeeder.php
    ├── EvenementSeeder.php
    ├── FormulaireSeeder.php
    ├── InscriptionSeeder.php
    ├── TacheSeeder.php
    └── UtilisateurSeeder.php
```

## Rôle des différents dossiers

### 1. `factories`

Les factories permettent de générer des données fictives automatiquement.

Elles sont principalement utilisées pour :

- les tests (`Unit` / `Feature`) ;
- le remplissage rapide de la base en développement.

Exemple d'utilisation :

```php
Utilisateur::factory()->create();
```

Ou avec plusieurs enregistrements :

```php
Utilisateur::factory()->count(10)->create();
```

#### Intérêt

- éviter d’écrire des données à la main ;
- générer des jeux de données cohérents ;
- accélérer les tests.

### 2. `migrations`

Les migrations définissent la structure de la base de données.

Chaque fichier correspond à une modification du schéma :

- création de table ;
- ajout de colonne ;
- modification de structure ;
- suppression.

Exemple :

```php
Schema::create('utilisateurs', function (Blueprint $table) {
    $table->id();
    $table->string('nom');
    $table->timestamps();
});
```

#### Fonctionnement

- exécutées avec :

```bash
php artisan migrate
```

- rollback possible :

```bash
php artisan migrate:rollback
```

#### Convention

Le nom des fichiers suit un format :

```
YYYY_MM_DD_HHMMSS_nom_action.php
```

Exemple :

```
2025_12_08_212523_create_utilisateurs_table.php
```

Cela garantit l’ordre d’exécution.

### 3. `seeders`

Les seeders permettent d’insérer des données dans la base.

Ils sont utilisés pour :

- initialiser la base ;
- créer des données de démonstration ;
- préparer un environnement de test.

Exemple :

```php
public function run(): void
{
    Utilisateur::factory()->count(10)->create();
}
```

Exécution :

```bash
php artisan db:seed
```

Ou :

```bash
php artisan migrate:fresh --seed
```

## Cas particulier : dossier `images`

Le dossier :

```text
database/seeders/images/
```

contient des images utilisées lors du seeding.

Organisation :

```text
images/
├── actualites/
└── evenements/
```

Ces fichiers servent à :

- associer des images réalistes aux données seedées ;
- simuler un environnement proche de la production.

Exemple :

- une actualité avec `carnaval.jpg`
- un événement avec `kermesse.jpg`

## Seeder principal : `DatabaseSeeder`

Le fichier :

```php
DatabaseSeeder.php
```

est le point d’entrée de tous les seeders.

Exemple :

```php
public function run(): void
{
    $this->call([
        UtilisateurSeeder::class,
        ActualiteSeeder::class,
        EvenementSeeder::class,
    ]);
}
```

Il permet de centraliser l’exécution.

## Lien entre migrations, factories et seeders

Ces trois éléments fonctionnent ensemble :

1. **Migrations**
   → définissent la structure

2. **Factories**
   → génèrent les données

3. **Seeders**
   → injectent les données

Schéma logique :

```text
Migration → crée les tables
Factory → génère les objets
Seeder → insère en base
```

## Exemple complet de workflow

### 1. Création des tables

```bash
php artisan migrate
```

### 2. Remplissage de la base

```bash
php artisan db:seed
```

Ou en une seule commande :

```bash
php artisan migrate:fresh --seed
```

## Bonnes pratiques

- une migration = une responsabilité ;
- ne jamais modifier une ancienne migration en production ;
- utiliser les factories pour éviter les données codées en dur ;
- centraliser les seeders dans `DatabaseSeeder` ;
- organiser les images et assets utilisés pour le seeding ;
- garder une cohérence entre nom des tables, models et seeders.

## Résumé

- `factories` : génération de données fictives ;
- `migrations` : structure de la base ;
- `seeders` : insertion des données ;
- `images` : ressources utilisées lors du seeding ;
- `DatabaseSeeder` : point central d’exécution.

Ce système permet de reconstruire entièrement une base de données de manière fiable, reproductible et automatisée.