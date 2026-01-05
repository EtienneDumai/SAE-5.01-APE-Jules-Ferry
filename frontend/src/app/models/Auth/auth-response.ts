import { Utilisateur } from '../Utilisateur/utilisateur';

export interface AuthResponse {
  message: string;
  user: Utilisateur;
  token: string;
}