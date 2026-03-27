<?php

/**
 * Fichier : backend/app/Mail/SetPasswordEmail.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier prepare l'email de definition de mot de passe.
 * Il transmet a l'utilisateur les informations necessaires pour activer son acces.
 */

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SetPasswordEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $url;
    public string $prenom;

    public function __construct(string $url, string $prenom)
    {
        $this->url = $url;
        $this->prenom = $prenom;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Créez votre mot de passe - APE Jules Ferry',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.set-password',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}