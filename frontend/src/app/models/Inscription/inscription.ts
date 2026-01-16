import { Creneau } from '../Creneau/creneau';

export interface Inscription {
    id_inscription?: number;
    id_utilisateur: number;
    id_creneau: number;
    commentaire: string | null;
    created_at?: string;
    updated_at?: string;
    creneau?: Creneau;
}