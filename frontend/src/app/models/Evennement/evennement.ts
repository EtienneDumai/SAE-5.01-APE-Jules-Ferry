import { StatutEvennement } from "../../enums/StatutEvennement/statut-evennement";


export interface Evennement {
    id_evennement: number;
    titre: string;
    descritption: string;
    date_evennement: Date;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    image_url: string;
    statut: StatutEvennement;
}
