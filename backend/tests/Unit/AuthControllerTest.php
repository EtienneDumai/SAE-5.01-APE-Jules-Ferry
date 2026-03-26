<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordlessController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Mail\MagicLinkEmail;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
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
    public function should_return_created_response_for_register_when_data_is_valid(): void
    {
        // GIVEN
        $controller = new RegisterController();
        $request = Request::create('/api/register', 'POST', [
            'nom' => 'Dupont',
            'prenom' => 'Jeanne',
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'mot_de_passe_confirmation' => 'password123',
        ]);

        // WHEN
        $response = $controller->register($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Inscription réussie', $response->getData(true)['message']);
        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'jeanne@example.com',
            'role' => 'parent',
            'statut_compte' => 'actif',
        ]);
    }

    #[Test]
    public function should_return_validation_error_for_register_when_email_is_already_used(): void
    {
        // GIVEN
        Utilisateur::factory()->create(['email' => 'jeanne@example.com']);
        $controller = new RegisterController();
        $request = Request::create('/api/register', 'POST', [
            'nom' => 'Dupont',
            'prenom' => 'Jeanne',
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'mot_de_passe_confirmation' => 'password123',
        ]);

        // WHEN / THEN
        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $controller->register($request);
    }

    // ---------------
    // LoginController
    // ---------------

    #[Test]
    public function should_return_success_response_for_login_when_credentials_are_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'statut_compte' => 'actif',
        ]);

        $controller = new LoginController();
        $request = Request::create('/api/login', 'POST', [
            'email' => $user->email,
            'mot_de_passe' => 'password123',
        ]);

        // WHEN
        $response = $controller->login($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Connexion réussie', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_unauthorized_for_login_when_credentials_are_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
        ]);

        $controller = new LoginController();
        $request = Request::create('/api/login', 'POST', [
            'email' => $user->email,
            'mot_de_passe' => 'wrong-password',
        ]);

        // WHEN
        $response = $controller->login($request);

        // THEN
        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame('Email ou mot de passe incorrect', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_forbidden_for_login_when_account_is_disabled(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create([
            'email' => 'jeanne@example.com',
            'mot_de_passe' => 'password123',
            'statut_compte' => 'desactive',
        ]);

        $controller = new LoginController();
        $request = Request::create('/api/login', 'POST', [
            'email' => $user->email,
            'mot_de_passe' => 'password123',
        ]);

        // WHEN
        $response = $controller->login($request);

        // THEN
        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('Votre compte est désactivé', $response->getData(true)['message']);
    }

    // ----------------
    // LogoutController
    // ----------------

    #[Test]
    public function should_return_success_for_logout_when_current_token_exists(): void
    {
        // GIVEN
        $state = (object) ['deleted' => false];
        $token = new class($state)
        {
            public function __construct(private object $state)
            {
            }

            public function delete(): void
            {
                $this->state->deleted = true;
            }
        };

        $user = new class($token)
        {
            public function __construct(private object $token)
            {
            }

            public function currentAccessToken(): object
            {
                return $this->token;
            }
        };

        $controller = new LogoutController();
        $request = Request::create('/api/logout', 'POST');
        $request->setUserResolver(static fn () => $user);

        // WHEN
        $response = $controller->logout($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Déconnexion réussie', $response->getData(true)['message']);
        $this->assertTrue($state->deleted);
    }

    // PasswordlessController

    #[Test]
    public function should_return_magic_link_action_for_check_email_when_user_is_parent(): void
    {
        // GIVEN
        Utilisateur::factory()->create([
            'email' => 'parent@example.com',
            'role' => 'parent',
        ]);

        $controller = new PasswordlessController();
        $request = Request::create('/api/check-email', 'POST', [
            'email' => 'parent@example.com',
        ]);

        // WHEN
        $response = $controller->checkEmail($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('send_magic_link', $response->getData(true)['action']);
    }

    #[Test]
    public function should_return_password_action_for_check_email_when_user_is_admin(): void
    {
        // GIVEN
        Utilisateur::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'administrateur',
        ]);

        $controller = new PasswordlessController();
        $request = Request::create('/api/check-email', 'POST', [
            'email' => 'admin@example.com',
        ]);

        // WHEN
        $response = $controller->checkEmail($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('require_password', $response->getData(true)['action']);
    }

    #[Test]
    public function should_send_magic_link_for_request_link_when_email_is_valid(): void
    {
        // GIVEN
        Mail::fake();

        $controller = new PasswordlessController();
        $request = Request::create('/api/magic-link', 'POST', [
            'email' => 'magic@example.com',
        ]);

        // WHEN
        $response = $controller->requestLink($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(
            'Lien de connexion généré (voir les logs ou la boîte mail)',
            $response->getData(true)['message']
        );
        $this->assertDatabaseHas('utilisateurs', [
            'email' => 'magic@example.com',
            'role' => 'parent',
        ]);
        Mail::assertSent(MagicLinkEmail::class);
    }

    #[Test]
    public function should_return_success_for_verify_link_when_signature_is_valid(): void
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

        $controller = new PasswordlessController();
        $request = Request::create($url, 'GET');

        // WHEN
        $response = $controller->verifyLink($request, $user->id_utilisateur);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Connexion réussie', $response->getData(true)['message']);
        $this->assertArrayHasKey('token', $response->getData(true));
        $this->assertArrayHasKey('refresh_token', $response->getData(true));
    }

    #[Test]
    public function should_return_unauthorized_for_verify_link_when_signature_is_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $controller = new PasswordlessController();
        $request = Request::create("/api/verify-link/{$user->id_utilisateur}", 'GET');

        // WHEN
        $response = $controller->verifyLink($request, $user->id_utilisateur);

        // THEN
        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame('Lien invalide ou expiré.', $response->getData(true)['message']);
    }
}
