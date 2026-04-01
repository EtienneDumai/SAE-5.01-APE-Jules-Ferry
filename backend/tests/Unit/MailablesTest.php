<?php

namespace Tests\Unit;

use App\Mail\ForgotPasswordEmail;
use App\Mail\MagicLinkEmail;
use App\Mail\RoleChangedEmail;
use App\Mail\SetPasswordEmail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MailablesTest extends TestCase
{
    #[Test]
    public function should_expose_expected_metadata_for_forgot_password_email(): void
    {
        $mail = new ForgotPasswordEmail('https://front/set-password', 'Alice');

        $this->assertSame('Réinitialisation de votre mot de passe - APE Jules Ferry', $mail->envelope()->subject);
        $this->assertSame('emails.forgot-password', $mail->content()->view);
        $this->assertSame([], $mail->attachments());
        $this->assertSame('Alice', $mail->prenom);
    }

    #[Test]
    public function should_expose_expected_metadata_for_magic_link_email(): void
    {
        $mail = new MagicLinkEmail('https://front/magic');

        $this->assertSame('Votre lien de connexion - APE Jules Ferry', $mail->envelope()->subject);
        $this->assertSame('emails.magic-link', $mail->content()->view);
        $this->assertSame([], $mail->attachments());
        $this->assertSame('https://front/magic', $mail->url);
    }

    #[Test]
    public function should_expose_expected_metadata_for_role_changed_email(): void
    {
        $mail = new RoleChangedEmail('Bob', 'Administrateur');

        $this->assertSame('Votre rôle a été mis à jour - APE Jules Ferry', $mail->envelope()->subject);
        $this->assertSame('emails.role-changed', $mail->content()->view);
        $this->assertSame([], $mail->attachments());
        $this->assertSame('Administrateur', $mail->nouveauRole);
    }

    #[Test]
    public function should_expose_expected_metadata_for_set_password_email(): void
    {
        $mail = new SetPasswordEmail('https://front/set-password', 'Chloe');

        $this->assertSame('Créez votre mot de passe - APE Jules Ferry', $mail->envelope()->subject);
        $this->assertSame('emails.set-password', $mail->content()->view);
        $this->assertSame([], $mail->attachments());
        $this->assertSame('Chloe', $mail->prenom);
    }
}
