show_menu() {
    clear
    echo "=============================="
    echo "        MENU UTILS"
    echo "=============================="
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo "       Frontend Angular       "
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    echo " 1) Lancer le front en mode dev"
    echo " 2) Lancer le back en mode production"
    echo " 3) Generer un composant Angular"
    echo " 4) Generer un service Angular"
    echo "------------------------------"
    echo " 0) Quitter"
    echo "=============================="
    echo -n "Votre choix : "
}
generate_component() {
    echo -n "Entrez le nom du composant Angular à générer : "
    read component_name
    cd frontend && ng generate component components/"$component_name" && cd ..
    echo "Composant '$component_name' généré avec succès."
    echo "Appuyez sur une touche pour continuer..."
    read -n 1
}
generate_service() {
    echo -n "Entrez le nom du service Angular à générer : "
    read service_name
    cd frontend && ng generate service services/"$service_name"/"$service_name" && cd ..
    echo "Service '$service_name' généré avec succès."
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
            generate_component
            ;;
        4)
            generate_service
            ;;
        0)
            echo "Au revoir!"
            exit 0
            ;;
    esac
done