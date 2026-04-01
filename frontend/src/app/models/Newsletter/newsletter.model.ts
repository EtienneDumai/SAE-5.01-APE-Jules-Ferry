/**
 * Fichier : frontend/src/app/models/Newsletter/newsletter.model.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit le modele newsletter.model utilise dans le frontend.
 */

/* Représentantion des données envoyées par l'utilisateur pendant l'inscription */
export interface NewsletterSubscription {
    email: string;
}

export interface AdminNewsletterSubscription extends NewsletterSubscription {
    admin_password: string;
}

export interface NewsletterSubscriber {
    id_abonne: number;
    email: string;
    statut: 'actif' | 'desinscrit';
    created_at: string;
    updated_at: string;
}

/* Représentantion de la réponse renvoyé par l'API après l'inscription */
export interface NewsletterResponse {
    message: string;
}
