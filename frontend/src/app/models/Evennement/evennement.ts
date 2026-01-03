import { StatutEvennement } from "../../enums/StatutEvennement/statut-evennement";


export interface Evennement {
    id_evennement: number;
    titre: string;
    description: string;
    date_evennement: Date;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    image_url: string;
    statut: StatutEvennement;
    id_auteur: number; //clef étrangère vers un utilisateur
    id_formulaire: number; //clef étrangère vers un formulaire
}
