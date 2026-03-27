<?php

/**
 * Fichier : backend/app/Mail/MagicLinkEmail.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier prepare l'email de connexion par lien magique.
 * Il construit le message envoye a l'utilisateur pour acceder a son compte sans mot de passe.
 */

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLinkEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $url;

    public function __construct(string $url)
    {
        $this->url = $url;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre lien de connexion - APE Jules Ferry',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.magic-link',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}