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
    echo " 2) Lancer le back en mode production"
    echo " 3) Generer un composant Angular"
    echo " 4) Generer un service Angular"
    echo " 5) Generer un modele Angular"
    echo "------------------------------"
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "       Backend Laravel        "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "------------------------------"
    echo " 11) Lancer le back en mode dev"
    echo " 12) Lancer le back en mode production"
    echo " 13) Generer un modele Laravel"
    echo " 14) Generer un modele Laravel avec migration"

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
        0)
            echo "Au revoir!"
            exit 0
            ;;
    esac
done