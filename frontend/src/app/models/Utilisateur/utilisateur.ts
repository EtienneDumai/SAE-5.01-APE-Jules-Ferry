import { RoleUtilisateur } from "../../enums/RoleUtilisateur/role-utilisateur";
import { StatutCompte } from "../../enums/StatutCompte/statut-compte";

export interface Utilisateur {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe?: string; // En optionnel car lors de la modification, on ne modifie pas le mot de passe
    role: RoleUtilisateur;
    statut_compte: StatutCompte;
}
