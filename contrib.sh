#!/bin/bash

# ==========================
# CONFIGURATION
# ==========================

# Commit d'initialisation (Angular + Laravel)
FIRST_COMMIT="80d145c29e13d8e567041c161b096b98197cb61a"

# Branche cible (master ou main)
BRANCH="develop"

if [ -z "$FIRST_COMMIT" ]; then
  echo "Usage: ./stats-code-metier.sh <hash_commit_init>"
  exit 1
fi

# ==========================
# EXCLUSIONS (BRUIT)
# ==========================

EXCLUDES=(
  # Angular
  ':!frontend/package.json'
  ':!frontend/package-lock.json'
  ':!frontend/angular.json'
  ':!frontend/tsconfig*.json'
  ':!frontend/src/main.ts'
  ':!frontend/src/polyfills.ts'
  ':!frontend/src/index.html'
  ':!frontend/src/test.ts'

  # Laravel
  ':!backend/composer.json'
  ':!backend/composer.lock'
  ':!backend/package.json'
  ':!backend/package-lock.json'
  ':!backend/bootstrap/*'
  ':!backend/public/index.php'
  ':!backend/artisan'

  # Commun
  ':!.env*'
  ':!.editorconfig'
  ':!.gitignore'
  ':!.vscode/*'
  ':!.idea/*'
)

# ==========================
# CALCUL
# ==========================

echo "Statistiques de code métier (depuis $FIRST_COMMIT → $BRANCH)"
echo "-----------------------------------------------------------"

git log "$FIRST_COMMIT"..$BRANCH --format='%aN' | sort -u | while read -r author; do
  git log "$FIRST_COMMIT"..$BRANCH --author="$author" --numstat -- . \
    "${EXCLUDES[@]}" \
  | awk -v name="$author" '
      NF==3 {
        add += $1
        del += $2
      }
      END {
        if (add > 0 || del > 0)
          printf "%s : %d+ %d-\n", name, add, del
      }'
done
