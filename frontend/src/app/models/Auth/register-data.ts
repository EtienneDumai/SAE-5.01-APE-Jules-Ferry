/**
 * Fichier : frontend/src/app/models/Auth/register-data.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele register data utilise dans le frontend.
 */

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  mot_de_passe_confirmation: string;
}