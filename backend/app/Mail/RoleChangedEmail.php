<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RoleChangedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $prenom;
    public string $nouveauRole;

    public function __construct(string $prenom, string $nouveauRole)
    {
        $this->prenom = $prenom;
        $this->nouveauRole = $nouveauRole;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre rôle a été mis à jour - APE Jules Ferry',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.role-changed',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}