/**
 * Fichier : frontend/src/app/models/Auth/auth-response.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele auth response utilise dans le frontend.
 */

import { Utilisateur } from '../Utilisateur/utilisateur';

export interface AuthResponse {
  message: string;
  user: Utilisateur;
  token: string;
}