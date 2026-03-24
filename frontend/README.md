# APE Jules Ferry App Front

## 🏗️ Architecture des dossiers et fichiers

- `public` 🎨 : contient les images et documents statiques qui sont envoyés en même temps que l'interface de l'application aux clients (ordinateurs).

Dans le dossier `src`, vous trouverez l'ensemble de l'application.


- `src/app` 📁 : contient les composants, pipes, directives, animations et services utilisés par l'application.

### Le dossier 'app'

Le dossier `app` contient le code principal de l'application.

#### Composants

- `src/app/authentication` 🎨 : Dossier comprenants les composants personnalisés utilisé par l'application.

### Enumérations

- `src/app/enums` 🔧 : contient les type énumérés de l'application utilisés au travers des types (models) de l'application.

### Environnements

- `src/environments` ⚙️ : stocke les environnements de développement et de production.
- 
### Guards

- `src/app/guards` 👥 : contient les guards de l'application, utilisés empecher l'accès à certaines parties de l'application si l'utilisateur n'a pas de compte avec un rôle pouvant y accèder.

### Interceptors

- `src/app/interceptors` 📡 : contient les intercepteurs de l'application, utilisés pour ne pas afficher de page d'erreur par défaut du moteur web.

### Models

- `src/app/models` 🏷️ : contient les models représentant les données transmises par le backend de l'application, utilisés pour utiliser le typage fort de TypeScript.

### Pages

- `src/app/pages` 🖥️ : contient les pages de l'application, basées sur les maquettes de l'application (ensuite soumisent à une refonte graphique).

### Services

- `src/app/services` 🛠️ : contient les services qui récupèrent, modifient ou met a jour les données en contactant une ou plusieurs API.

### Ressources partagées

- `src/app/shared` 👥 : contient les composants partagés de l'application, tels que la sidebar de navigation.

## 🚀 Lancer l'application

Avant toute chose, consultez le dépôt [start-n-go](https://github.com/Inviseo/start-and-go) pour vous lancer.

Assurez-vous d'avoir les droits d'accès, sinon vous ne pourrez pas cloner les dépôts.

### Clonez le dépôt de la solution :

#### HTTP : 

```bash
    git clone https://github.com/EtienneDumai/SAE-5.01-APE-Jules-Ferry.git
```
#### SSH : 

```bash
    git clone git@github.com:EtienneDumai/SAE-5.01-APE-Jules-Ferry.git
```

Déplacez-vous dans le front :

```bash
    cd SAE-5.01-APE-Jules-Ferry/frontend
```

Installez les packages node :

```bash
    npm install
```

Lancer le serveur : 
[documentation du repo](https://github.com/EtienneDumai/SAE-5.01-APE-Jules-Ferry/blob/master/README.md) 


L'application devrait s'ouvrir dans votre navigateur par défaut à l'adresse http://localhost:4200.

## 🔄 Mise à jour après git pull

Après chaque `git pull` effectué sur le front, lancez l'installation des packages npm.

```bash
    npm install
```