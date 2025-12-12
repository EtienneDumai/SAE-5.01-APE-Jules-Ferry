import { StatutFormulaire } from "../../enums/StatutFormulaire/statut-formulaire";

export interface Formulaire {
    id_formulaire: number;
    nom_formulaire: string;
    description: string;
    statut: StatutFormulaire;
}
