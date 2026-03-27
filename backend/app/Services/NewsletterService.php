<?php

/**
 * Fichier : backend/app/Services/NewsletterService.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce service gere les traitements lies a la newsletter.
 * Il centralise la logique utile a l'inscription, a l'envoi ou au suivi des abonnes.
 */

namespace App\Services;

use App\Models\AbonneNewsletter;

class NewsletterService
{
    // Cherche avec l'email et met à jour ou crée avec le statut actif
    public function inscrire(string $email)
    {
        $abonne = AbonneNewsletter::where('email', $email)->first();

        if ($abonne) {
            if ($abonne->statut !== 'actif') {
                $abonne->update(['statut' => 'actif']);
            }
            return $abonne;
        }

        return AbonneNewsletter::create([
            'email' => $email,
            'statut' => 'actif'
        ]);
    }
}