/**
 * Fichier : frontend/src/app/models/Inscription/inscription.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele inscription utilise dans le frontend.
 */

import { Creneau } from '../Creneau/creneau';

import { Utilisateur } from '../Utilisateur/utilisateur';

export interface Inscription {
    id_inscription?: number;
    id_utilisateur: number;
    id_creneau: number;
    commentaire: string | null;
    created_at?: string;
    updated_at?: string;
    creneau?: Creneau;
    utilisateur?: Utilisateur;
}