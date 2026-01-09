/* Représentantion des données envoyées par l'utilisateur pendant l'inscription */
export interface NewsletterSubscription {
    email: string;
}

/* Représentantion de la réponse renvoyé par l'API après l'inscription */
export interface NewsletterResponse {
    message: string;
}