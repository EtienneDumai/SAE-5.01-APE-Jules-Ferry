/**
 * Fichier : frontend/src/app/models/TypeToast/type-toast.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele type toast utilise dans le frontend.
 */

import { TypeErreurToast } from "../../enums/TypeErreurToast/type-erreur-toast";

export interface TypeToast {
    message: string;
    type : TypeErreurToast;
}
