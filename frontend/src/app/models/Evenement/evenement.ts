/**
 * Fichier : frontend/src/app/models/Evenement/evenement.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele evenement utilise dans le frontend.
 */

import { StatutEvenement } from "../../enums/StatutEvenement/statut-evenement";

import { Formulaire } from "../Formulaire/formulaire";

export interface Evenement {
    id_evenement: number;
    titre: string;
    description: string;
    date_evenement: Date | string;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    image_url: string;
    statut: StatutEvenement | string;
    id_auteur: number;
    id_formulaire: number | null;
    formulaire?: Formulaire;
    created_at?: string;
    updated_at?: string;
}