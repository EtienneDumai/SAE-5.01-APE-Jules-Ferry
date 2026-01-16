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
    id_auteur: number;
    id_formulaire: number | null;
    created_at?: string;
    updated_at?: string;
}
