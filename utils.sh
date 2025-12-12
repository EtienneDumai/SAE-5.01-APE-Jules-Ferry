show_menu() {
    clear
    echo "=============================="
    echo "        MENU UTILS"
    echo "=============================="
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "       Frontend Angular       "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "------------------------------"
    echo " 1) Lancer le front en mode dev"
    echo " 2) Lancer le front en mode production"
    echo " 3) Generer un composant Angular"
    echo " 4) Generer un service Angular"
    echo " 5) Generer un modele Angular"
    echo " 6) Generer une page Angular"
    echo " 7) Generer un enum Angular"
    echo "------------------------------"
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "       Backend Laravel        "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "------------------------------"
    echo " 11) Lancer le back en mode dev"
    echo " 12) Lancer le back en mode production"
    echo " 13) Generer un modele Laravel"
    echo " 14) Generer un modele Laravel avec migration"
    echo " 15) Generer un controleur Laravel"
    echo " 16) Generer un middleware Laravel"
    echo "------------------------------"
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "        Base de données       "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "------------------------------"
    echo " 21) Lancer la base de données"
    echo " 22) Arrêter la base de données"
    echo "------------------------------"
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "          GIT Commands        "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "------------------------------"
    echo " 31) Tirer les dernières modifications"
    echo " 32) Pousser les modifications locales"
    echo "------------------------------"
    echo " 0) Quitter"
    echo "=============================="
    echo -n "Votre choix : "
}
generate_component_angular() {
    echo -n "Entrez le nom du composant Angular à générer : "
    read component_name
    cd frontend && ng generate component components/"$component_name" && cd ..
    echo "Composant '$component_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_page_angular() {
    echo -n "Entrez le nom de la page Angular à générer : "
    read page_name
    cd frontend && ng generate component pages/"$page_name" && cd ..
    echo "Page '$page_name' générée avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_service_angular() {
    echo -n "Entrez le nom du service Angular à générer : "
    read service_name
    cd frontend && ng generate service services/"$service_name"/"$service_name" && cd ..
    echo "Service '$service_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_model_angular() {
    echo -n "Entrez le nom du modèle Angular à générer : "
    read model_name
    cd frontend && ng generate interface models/"$model_name"/"$model_name" && cd ..
    echo "Modèle '$model_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_enum_angular() {
    echo -n "Entrez le nom de l'énum Angular à générer : "
    read enum_name
    cd frontend && ng generate enum enums/"$enum_name"/"$enum_name" && cd ..
    echo "Énumération '$enum_name' générée avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_model_laravel() {
    echo -n "Entrez le nom du modèle Laravel à générer : "
    read model_name
    cd backend && php artisan make:model "$model_name" && cd ..
    echo "Modèle '$model_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_model_laravel_with_migration() {
    echo -n "Entrez le nom du modèle Laravel à générer avec migration : "
    read model_name
    cd backend && php artisan make:model "$model_name" -m && cd ..
    echo "Modèle '$model_name' avec migration généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_controller_laravel() {
    echo -n "Entrez le nom du contrôleur Laravel à générer : "
    read controller_name
    cd backend && php artisan make:controller "$controller_name" && cd ..
    echo "Contrôleur '$controller_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_middleware_laravel() {
    echo -n "Entrez le nom du middleware Laravel à générer : "
    read middleware_name
    cd backend && php artisan make:middleware "$middleware_name" && cd ..
    echo "Middleware '$middleware_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
git_pull() {
    git pull origin $(git branch --show-current)
    echo "Mises à jour tirées avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
git_push() {
    echo -n "Entrez le message de commit : "
    read commit_message
    git add .
    git commit -m "$commit_message"
    git push origin $(git branch --show-current)
    echo "Modifications poussées avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
while true; do
    show_menu
    read choice

    case "$choice" in
        1)
            cd frontend && ng build --configuration=development && ng serve --configuration=development && cd ..
            ;;
        2)
            cd frontend && ng build --configuration=production && ng serve --configuration=production && cd ..
            ;;
        3)
            generate_component_angular
            ;;
        4)
            generate_service_angular
            ;;
        5)
            generate_model_angular
            ;;
        6)
            generate_page_angular
            ;;
        7)
            generate_enum_angular
            ;;
        11)
            cd backend && php artisan serve && cd ..
            ;;
        12)
            cd backend && php artisan serve --env=production && cd ..
            ;;
        13)
            generate_model_laravel
            ;;
        14)
            generate_model_laravel_with_migration
            ;;
        15)
            generate_controller_laravel
            ;;
        16)
            generate_middleware_laravel
            ;;
        21)
            docker run --name ape-postgres -d \
            -e POSTGRES_DB=ape_db \
            -e POSTGRES_USER=ape_user \
            -e POSTGRES_PASSWORD=ape_password \
            -p 5432:5432 \
            -v ./db-data:/var/lib/postgresql/data \
            postgres:16
            ;;
        22)
            docker stop ape-postgres
            docker rm ape-postgres
            ;;
        31)
            git_pull
            ;;
        32)
            git_push
            ;;
        0)
            echo "Au revoir!"
            exit 0
            ;;
    esac
done