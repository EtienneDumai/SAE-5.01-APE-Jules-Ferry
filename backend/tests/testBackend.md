# Documentation des tests

## Organisation du dossier `tests`

Les tests sont organisés en deux grandes catégories :

```text
tests/
├── Feature/
│   ├── ActualiteControllerTest.php
│   ├── AuthControllerTest.php
│   ├── CreneauControllerTest.php
│   ├── ExampleTest.php
│   ├── FormulaireControllerTest.php
│   ├── InscriptionControllerTest.php
│   ├── NewsletterControllerTest.php
│   ├── TacheControllerTest.php
│   └── UtilisateurControllerTest.php
└── Unit/
    ├── Images/
    │   └── ImageConverterTest.php
    ├── ActualiteControllerTest.php
    ├── AuthControllerTest.php
    ├── ExampleTest.php
    ├── FormulaireControllerTest.php
    ├── InscriptionControllerTest.php
    ├── NewsletterControllerTest.php
    └── TacheControllerTest.php
```

## Rôle des deux types de tests

### Tests `Feature`

Les tests placés dans `tests/Feature` servent à vérifier le comportement global de l'application.

Ils permettent généralement de tester :

- les routes ;
- les contrôleurs ;
- les réponses HTTP ;
- les interactions entre plusieurs parties de l'application.

Autrement dit, un test de type **Feature** vérifie qu'une fonctionnalité fonctionne correctement du point de vue applicatif.

Exemples visibles dans le projet :

- `ActualiteControllerTest.php`
- `AuthControllerTest.php`
- `CreneauControllerTest.php`
- `FormulaireControllerTest.php`
- `InscriptionControllerTest.php`
- `NewsletterControllerTest.php`
- `TacheControllerTest.php`
- `UtilisateurControllerTest.php`

### Tests `Unit`

Les tests placés dans `tests/Unit` servent à vérifier une unité de code isolée.

Ils permettent généralement de tester :

- une méthode ;
- un service ;
- une classe ;
- un traitement précis sans forcément tester toute la chaîne applicative.

Dans le projet, on voit par exemple un sous-dossier `Images` contenant :

- `ImageConverterTest.php`

Ce type de test est utile pour vérifier un comportement technique précis, par exemple une conversion d'image, sans passer par toute la logique HTTP de l'application.

## Format utilisé dans les tests

Les tests suivent une structure claire et lisible basée sur trois étapes :

- **GIVEN**
- **WHEN**
- **THEN**

Cette écriture permet de comprendre rapidement :

1. le contexte de départ ;
2. l'action réalisée ;
3. le résultat attendu.

## Exemple de structure

```php
#[Test]
public function should_convert_jpeg_image_to_webp(): void
{
    // GIVEN
    $fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
    $sourcePath = $fakeImage->getPathname();

    // WHEN
    $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);

    // THEN
    $this->assertTrue($result);
    $this->assertFileExists($this->tempsPath);
    $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
}
```

## Explication détaillée du format

### 1. `#[Test]`

L'attribut `#[Test]` indique que la méthode est un test.

Cela permet à PHPUnit d'identifier explicitement cette méthode comme devant être exécutée comme test.

Exemple :

```php
#[Test]
public function should_convert_jpeg_image_to_webp(): void
```

### 2. Nom des méthodes de test

Le nom du test est écrit de manière descriptive.

Exemple :

```php
should_convert_jpeg_image_to_webp
```

Ce nom indique directement :

- ce qui est testé ;
- l'action attendue ;
- le résultat attendu.

### 3. Bloc `GIVEN`

Le bloc `GIVEN` prépare les données nécessaires au test.

Exemple :

```php
$fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
$sourcePath = $fakeImage->getPathname();
```

Rôle :

- générer une image fictive ;
- récupérer son chemin ;
- préparer le contexte.

### 4. Bloc `WHEN`

Le bloc `WHEN` exécute l'action que l'on veut tester.

Exemple :

```php
$result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);
```

Rôle :

- appeler la méthode à tester.

### 5. Bloc `THEN`

Le bloc `THEN` contient les vérifications.

Exemple :

```php
$this->assertTrue($result);
$this->assertFileExists($this->tempsPath);
$this->assertEquals('image/webp', mime_content_type($this->tempsPath));
```

Rôle :

- vérifier le résultat ;
- vérifier l'existence du fichier ;
- vérifier le type MIME.

## Assertions utilisées

### `assertTrue`

```php
$this->assertTrue($result);
```

Vérifie que la valeur est vraie.

### `assertFileExists`

```php
$this->assertFileExists($this->tempsPath);
```

Vérifie qu'un fichier existe.

### `assertEquals`

```php
$this->assertEquals('image/webp', mime_content_type($this->tempsPath));
```

Compare deux valeurs.

## Intérêt de ce format

- lisibilité ;
- structure claire ;
- compréhension rapide ;
- homogénéité dans le projet ;
- facilité de maintenance.

## Résumé

- `tests/Feature` : tests fonctionnels (API, contrôleurs, flux complets) ;
- `tests/Unit` : tests unitaires (logique isolée) ;
- utilisation de `#[Test]` ;
- noms explicites ;
- structure **GIVEN / WHEN / THEN** ;
- assertions PHPUnit.

## Modèle de test

```php
#[Test]
public function should_do_something_expected(): void
{
    // GIVEN
    // Préparer le contexte

    // WHEN
    // Exécuter l'action

    // THEN
    // Vérifier les résultats
}
```


## Bonnes pratiques

- séparer `Feature` et `Unit` ;
- nommer clairement les tests ;
- garder une structure cohérente ;
- utiliser des assertions adaptées.