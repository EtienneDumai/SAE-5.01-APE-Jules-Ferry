# Preparer son environnement de benchmarking
- Build les applications frontend en mode production (React, Vue et Angular) :
```bash
    cd frontend-react && npm i && npm run build && cd .. 
    && cd frontend-vue && npm i && npm run build && cd ..
    && cd frontend-angular && npm i && ng build --prod && cd ..
```
- Lancer le docker compose : 
```bash
    docker-compose up --build
```
- Seed les databases (PostgreSQL, mySQL et MongoDB) :
```bash
    docker compose exec db-bench-app node scripts/seed.js
```
- Lancer le script dans un terminal linux (git bash par exemple) qui permet de faire tout les benchmarks depuis la racine du projet de benchmarking  (bench_labo) :
```bash
    ./bench.sh
```