<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordEmail extends Mailable
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
            subject: 'Réinitialisation de votre mot de passe - APE Jules Ferry',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.forgot-password',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}