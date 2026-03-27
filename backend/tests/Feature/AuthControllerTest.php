<?php

/**
 * Fichier : backend/tests/Feature/AuthControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour AuthControllerTest.
 */

namespace Tests\Feature;

use App\Mail\MagicLinkEmail;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    // ------------------
    // RegisterController
    // ------------------

    #[Test]
    public function should_register_user_for_register_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $payload = [
            'nom' => 'Dupont',
            'prenom' => 'Jeanne',
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'mot_de_passe_confirmation' => 'password123',
        ];

        // WHEN
        $response = $this->postJson('/api/register', $payload);

        // THEN
        $response->assertStatus(201)
            ->assertJsonPath('message', 'Inscription réussie')
            ->assertJsonPath('user.email', 'jeanne@example.com');

        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'jeanne@example.com',
            'role' => 'parent',
        ]);
    }

    #[Test]
    public function should_return_validation_errors_for_register_endpoint_when_email_is_already_used(): void
    {
        // GIVEN
        Utilisateur::factory()->create(['email' => 'jeanne@example.com']);

        // WHEN
        $response = $this->postJson('/api/register', [
            'nom' => 'Dupont',
            'prenom' => 'Jeanne',
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'mot_de_passe_confirmation' => 'password123',
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ---------------
    // LoginController
    // ---------------

    #[Test]
    public function should_login_user_for_login_endpoint_when_credentials_are_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'statut_compte' => 'actif',
        ]);

        // WHEN
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'mot_de_passe' => 'password123',
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Connexion réussie')
            ->assertJsonPath('user.email', $user->email);
    }

    #[Test]
    public function should_return_unauthorized_for_login_endpoint_when_credentials_are_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
        ]);

        // WHEN
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'mot_de_passe' => 'wrong-password',
        ]);

        // THEN
        $response->assertStatus(401)
            ->assertJsonPath('message', 'Email ou mot de passe incorrect');
    }

    #[Test]
    public function should_return_forbidden_for_login_endpoint_when_account_is_disabled(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'statut_compte' => 'desactive',
        ]);

        // WHEN
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'mot_de_passe' => 'password123',
        ]);

        // THEN
        $response->assertStatus(403)
            ->assertJsonPath('message', 'Votre compte est désactivé');
    }

    // ----------------
    // LogoutController
    // ----------------

    #[Test]
    public function should_logout_user_for_logout_endpoint_when_user_is_authenticated(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // WHEN
        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Déconnexion réussie');
    }

    // PasswordlessController

    #[Test]
    public function should_return_password_action_for_check_email_endpoint_when_user_is_admin(): void
    {
        // GIVEN
        Utilisateur::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'administrateur',
        ]);

        // WHEN
        $response = $this->postJson('/api/check-email', [
            'email' => 'admin@example.com',
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('action', 'require_password');
    }

    #[Test]
    public function should_return_magic_link_action_for_check_email_endpoint_when_user_is_parent(): void
    {
        // GIVEN
        Utilisateur::factory()->create([
            'email' => 'parent@example.com',
            'role' => 'parent',
        ]);

        // WHEN
        $response = $this->postJson('/api/check-email', [
            'email' => 'parent@example.com',
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('action', 'send_magic_link');
    }

    #[Test]
    public function should_send_magic_link_for_magic_link_endpoint_when_email_is_valid(): void
    {
        // GIVEN
        Mail::fake();

        // WHEN
        $response = $this->postJson('/api/magic-link', [
            'email' => 'magic@example.com',
        ]);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Lien de connexion généré (voir les logs ou la boîte mail)');

        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'magic@example.com',
        ]);
        Mail::assertSent(MagicLinkEmail::class);
    }

    #[Test]
    public function should_verify_link_for_verify_link_endpoint_when_signature_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'magic@example.com',
            'role' => 'parent',
        ]);

        $url = URL::temporarySignedRoute(
            'auth.magic.verify',
            now()->addMinutes(30),
            ['id_utilisateur' => $user->id_utilisateur]
        );

        // WHEN
        $response = $this->getJson($url);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('message', 'Connexion réussie')
            ->assertJsonPath('user.email', 'magic@example.com');
    }

    #[Test]
    public function should_return_unauthorized_for_verify_link_endpoint_when_signature_is_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();

        // WHEN
        $response = $this->getJson("/api/verify-link/{$user->id_utilisateur}");

        // THEN
        $response->assertStatus(401)
            ->assertJsonPath('message', 'Lien invalide ou expiré.');
    }
}
