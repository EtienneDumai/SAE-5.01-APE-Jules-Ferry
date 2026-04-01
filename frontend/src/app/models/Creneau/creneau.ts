/**
 * Fichier : frontend/src/app/models/Creneau/creneau.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele creneau utilise dans le frontend.
 */

import { Inscription } from '../Inscription/inscription';

export interface Creneau {
  id_creneau: number;
  heure_debut: string;
  heure_fin: string;
  quota: number;
  id_tache: number;
  created_at?: string;
  updated_at?: string;
  
  inscriptions_count?: number;
  inscriptions?: Inscription[]; 

  // logique des cases a coché pour créneaux pour front
  est_inscrit?: boolean;
  selected?: boolean;
  nom_tache?: string;
}