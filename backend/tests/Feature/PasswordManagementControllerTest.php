<?php

namespace Tests\Feature;

use App\Mail\ForgotPasswordEmail;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordManagementControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_send_forgot_password_email_for_authorized_roles(): void
    {
        Mail::fake();
        Cache::flush();
        $user = Utilisateur::factory()->create([
            'role' => 'administrateur',
            'email' => 'admin@example.com',
            'prenom' => 'Alice',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Si cet email existe, un lien vous a été envoyé.']);

        $this->assertNotNull(Cache::get('set_password_' . $user->id_utilisateur));
        Mail::assertSent(ForgotPasswordEmail::class);
    }

    #[Test]
    public function should_not_send_forgot_password_email_for_parent_role(): void
    {
        Mail::fake();
        Cache::flush();
        $user = Utilisateur::factory()->create([
            'role' => 'parent',
            'email' => 'parent@example.com',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Si cet email existe, un lien vous a été envoyé.']);

        $this->assertNull(Cache::get('set_password_' . $user->id_utilisateur));
        Mail::assertNothingSent();
    }

    #[Test]
    public function should_update_password_for_set_password_endpoint_when_token_is_valid(): void
    {
        $user = Utilisateur::factory()->create([
            'mot_de_passe' => Hash::make('old-password'),
        ]);
        Cache::put('set_password_' . $user->id_utilisateur, 'valid-token', now()->addHour());

        $response = $this->postJson('/api/set-password', [
            'id_utilisateur' => $user->id_utilisateur,
            'token' => 'valid-token',
            'mot_de_passe' => 'new-password123',
            'mot_de_passe_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Mot de passe créé avec succès.']);

        $this->assertTrue(Hash::check('new-password123', $user->fresh()->mot_de_passe));
        $this->assertNull(Cache::get('set_password_' . $user->id_utilisateur));
    }

    #[Test]
    public function should_return_unauthorized_for_set_password_endpoint_when_token_is_invalid(): void
    {
        $user = Utilisateur::factory()->create();
        Cache::put('set_password_' . $user->id_utilisateur, 'valid-token', now()->addHour());

        $response = $this->postJson('/api/set-password', [
            'id_utilisateur' => $user->id_utilisateur,
            'token' => 'invalid-token',
            'mot_de_passe' => 'new-password123',
            'mot_de_passe_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Lien invalide ou expiré.']);
    }
}
