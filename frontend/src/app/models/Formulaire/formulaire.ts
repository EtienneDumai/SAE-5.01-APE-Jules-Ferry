/**
 * Fichier : frontend/src/app/models/Formulaire/formulaire.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele formulaire utilise dans le frontend.
 */

import { StatutFormulaire } from "../../enums/StatutFormulaire/statut-formulaire";
import { Tache } from '../Tache/tache';

export interface Formulaire {
    id_formulaire: number;
    nom_formulaire: string;
    description: string;
    statut: StatutFormulaire;
    is_template?: boolean | number;
    id_createur: number;
    created_at?: string;
    updated_at?: string;
    taches?: Tache[];           
}