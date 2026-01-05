import { StatutEvenement } from "../../enums/StatutEvenement/statut-evenement";


export interface Evenement {
    id_evenement: number;
    titre: string;
    description: string;
    date_evenement: Date;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    image_url: string;
    statut: StatutEvenement;
}
