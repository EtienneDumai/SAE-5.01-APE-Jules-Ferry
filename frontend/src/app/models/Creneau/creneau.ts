export interface Creneau {
    id_creneau: number;
    heure_debut: string;
    heure_fin: string;
    quota: number;
    id_tache: number; //clef étrangère vers une tâche
}
