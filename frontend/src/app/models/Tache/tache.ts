import { Creneau } from '../Creneau/creneau';

export interface Tache {
    id_tache: number;
    nom_tache: string;
    description: string;
    heure_debut_globale: string;
    heure_fin_globale: string;
    id_formulaire: number;
    ordre?: number;
    created_at?: string;
    updated_at?: string;
    creneaux?: Creneau[];
}