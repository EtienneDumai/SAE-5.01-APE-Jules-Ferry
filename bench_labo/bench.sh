#!/bin/bash

# ==============================
#  Script de menu benchmark K6 + Front
#  À placer dans bench_labo/
# ==============================

# Fichiers k6 vus DEPUIS le conteneur k6 (working_dir = /scripts)
BACKEND_FILE="benchmarks.js"   # pour Laravel / Express / Nest
DB_FILE="db-bench.js"          # pour MySQL / PostgreSQL / MongoDB

# Script de bench front (Playwright) VU DEPUIS L'HÔTE
FRONT_SCRIPT="benchmarks/bench_front.mjs"

# Nom du service backend qui parle aux 3 BDD
DB_APP_SERVICE="db-bench-app"

show_menu() {
  clear
  echo "=============================="
  echo "        MENU BENCHMARK"
  echo "=============================="
  echo " 1) Benchmark Laravel (k6)"
  echo " 2) Benchmark Express (k6)"
  echo " 3) Benchmark NestJS (k6)"
  echo "------------------------------"
  echo " 4) Benchmark MySQL (k6)"
  echo " 5) Benchmark PostgreSQL (k6)"
  echo " 6) Benchmark MongoDB (k6)"
  echo "------------------------------"
  echo " 7) Benchmark Front (React + Vue + Angular)"
  echo "------------------------------"
  echo " 8) Lancer le docker compose si ce n'est pas déjà fait"
  echo "------------------------------"
  echo " 9) Arrêter le docker compose"
  echo "------------------------------"
  echo " 0) Quitter"
  echo "=============================="
  echo -n "Votre choix : "
}

run_k6_backend() {
  local label="$1"
  local target="$2"

  echo ""
  echo ">>> Lancement du benchmark backend : $label"
  echo ""

  # -e TARGET avant le nom du service k6
  docker compose run --rm -e TARGET="$target" k6 run "$BACKEND_FILE"

  echo ""
  echo ">>> Benchmark backend ($label) terminé."
  echo ""
  read -p "Appuyez sur [Entrée] pour revenir au menu..."
}

run_k6_db() {
  local label="$1"
  local target="$2"

  echo ""
  echo ">>> Lancement du benchmark BDD : $label"
  echo ""

  docker compose run --rm -e TARGET="$target" k6 run "$DB_FILE"

  echo ""
  echo ">>> Benchmark BDD ($label) terminé."
  echo ""
  read -p "Appuyez sur [Entrée] pour revenir au menu..."
}

run_front_bench() {
  echo ""
  echo ">>> Lancement du benchmark FRONT (React + Vue + Angular)"
  echo ""

  # Le script Playwright tourne sur la machine hôte
  node "$FRONT_SCRIPT"

  echo ""
  echo ">>> Benchmark FRONT terminé."
  echo ""
  read -p "Appuyez sur [Entrée] pour revenir au menu..."
}

while true; do
  show_menu
  read choice

  case "$choice" in
    1)
      # Laravel (backend-laravel:8000 dans le réseau docker)
      run_k6_backend "Laravel" "http://backend-laravel:8000/api/ping"
      ;;
    2)
      # Express (backend-express:3000)
      run_k6_backend "Express" "http://backend-express:3000/api/ping"
      ;;
    3)
      # NestJS (backend-nest:3000)
      run_k6_backend "NestJS" "http://backend-nest:3000/api/ping"
      ;;
    4)
      # MySQL via db-bench-app
      run_k6_db "MySQL" "http://$DB_APP_SERVICE:3000/mysql/products"
      ;;
    5)
      # PostgreSQL via db-bench-app
      run_k6_db "PostgreSQL" "http://$DB_APP_SERVICE:3000/postgres/products"
      ;;
    6)
      # MongoDB via db-bench-app
      run_k6_db "MongoDB" "http://$DB_APP_SERVICE:3000/mongo/products"
      ;;
    7)
      # Frontend (Playwright)
      run_front_bench
      ;;
    8)
      echo ""
      echo ">>> Lancement du docker compose..."
      echo ""
      docker-compose up --build -d
      echo ""
      echo ">>> Docker compose lancé."
      echo ""
      read -p "Appuyez sur [Entrée] pour revenir au menu..."
      ;;
    9)
      echo ""
      echo ">>> Arrêt du docker compose..."
      echo ""
      docker-compose down
      echo ""
      echo ">>> Docker compose arrêté."
      echo ""
      read -p "Appuyez sur [Entrée] pour revenir au menu..."
      ;;
    0)
      echo "Au revoir 👋"
      exit 0
      ;;
    *)
      echo "Choix invalide."
      sleep 1
      ;;
  esac
done
