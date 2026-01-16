import { StatutActualite } from "../../enums/StatutActualite/statut-actualite";

export interface Actualite {
    id_actualite: number;
    titre: string;
    contenu: string;
    image_url: string;
    date_publication: Date;
    statut: StatutActualite;
    id_auteur: number; //clef étrangère vers un utilisateur
    // date_creation: Date; peut être à mettre dépend des choix de conception
}
