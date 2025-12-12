import { StatutAbonne } from "../../enums/StatutAbonne/statut-abonne";

export interface AbonneNewsletter {
    id_abonne: number;
    email: string;
    statut: StatutAbonne;
}
