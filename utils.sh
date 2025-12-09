show_menu() {
    clear
    echo "=============================="
    echo "        MENU UTILS"
    echo "=============================="
    echo " 1) Lancer le front en mode dev"
    echo " 2) Lancer le back en mode production"
    echo "------------------------------"
    echo " 0) Quitter"
    echo "=============================="
    echo -n "Votre choix : "
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
        0)
            echo "Au revoir!"
            exit 0
            ;;
    esac
done