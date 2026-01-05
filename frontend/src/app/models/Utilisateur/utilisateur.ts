import { RoleUtilisateur } from "../../enums/RoleUtilisateur/role-utilisateur";
import { StatutCompte } from "../../enums/StatutCompte/statut-compte";

export interface Utilisateur {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    role: RoleUtilisateur;
    statut_compte: StatutCompte;
}
