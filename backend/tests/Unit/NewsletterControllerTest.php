<?php

/**
 * Fichier : backend/tests/Unit/NewsletterControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour NewsletterControllerTest.
 */

namespace Tests\Unit;

use App\Http\Controllers\Api\NewsletterController;
use App\Models\AbonneNewsletter;
use App\Models\Utilisateur;
use App\Services\NewsletterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NewsletterControllerTest extends TestCase
{
    use RefreshDatabase;

    private NewsletterService $newsletterService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->newsletterService = $this->mock(NewsletterService::class);
    }

    #[Test]
    public function should_return_created_response_for_store_when_email_is_valid(): void
    {
        // GIVEN
        $this->newsletterService
            ->shouldReceive('inscrire')
            ->once()
            ->with('test@example.com');

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'POST', [
            'email' => 'test@example.com',
        ]);

        // WHEN
        $response = $controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame(
            'Merci ! Ton inscription est bien prise en compte.',
            $response->getData(true)['message']
        );
    }

    #[Test]
    public function should_return_validation_errors_for_store_when_email_is_invalid(): void
    {
        // GIVEN
        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'POST', [
            'email' => 'pasUnMail',
        ]);

        // WHEN
        $response = $controller->store($request);

        // THEN
        $this->assertSame(422, $response->getStatusCode());
        $this->assertArrayHasKey('email', $response->getData(true)['errors']);
    }

    #[Test]
    public function should_return_abonnes_for_index_when_user_is_admin(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        AbonneNewsletter::factory()->count(3)->create();

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(static fn () => $admin);

        // WHEN
        $response = $controller->index($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(3, $response->getData(true));
    }

    #[Test]
    public function should_return_forbidden_for_index_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(static fn () => $user);

        // WHEN
        $response = $controller->index($request);

        // THEN
        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('Accès réservé aux administrateurs', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_created_response_for_store_admin_when_user_is_admin_and_email_is_valid(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->newsletterService
            ->shouldReceive('inscrire')
            ->once()
            ->with('admin-ajout@example.com');

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'POST', [
            'email' => 'admin-ajout@example.com',
        ]);
        $request->setUserResolver(static fn () => $admin);

        // WHEN
        $response = $controller->storeAdmin($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame(
            'Adresse email ajoutée à la newsletter.',
            $response->getData(true)['message']
        );
    }

    #[Test]
    public function should_return_forbidden_for_store_admin_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'POST', [
            'email' => 'admin-ajout@example.com',
        ]);
        $request->setUserResolver(static fn () => $user);

        // WHEN
        $response = $controller->storeAdmin($request);

        // THEN
        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('Accès réservé aux administrateurs', $response->getData(true)['message']);
    }

    #[Test]
    public function should_delete_abonne_for_destroy_when_user_is_admin_and_abonne_exists(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $abonne = AbonneNewsletter::factory()->create();

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'DELETE');
        $request->setUserResolver(static fn () => $admin);

        // WHEN
        $response = $controller->destroy($request, $abonne->id_abonne);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Abonné supprimé avec succès', $response->getData(true)['message']);
        $this->assertDatabaseMissing('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }

    #[Test]
    public function should_return_forbidden_for_destroy_when_user_is_not_admin(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $abonne = AbonneNewsletter::factory()->create();

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'DELETE');
        $request->setUserResolver(static fn () => $user);

        // WHEN
        $response = $controller->destroy($request, $abonne->id_abonne);

        // THEN
        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame('Accès réservé aux administrateurs', $response->getData(true)['message']);
        $this->assertDatabaseHas('abonnes_newsletter', [
            'id_abonne' => $abonne->id_abonne,
        ]);
    }

    #[Test]
    public function should_return_not_found_for_destroy_when_abonne_does_not_exist(): void
    {
        // GIVEN
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);

        $controller = new NewsletterController($this->newsletterService);
        $request = Request::create('/test', 'DELETE');
        $request->setUserResolver(static fn () => $admin);

        // WHEN
        $response = $controller->destroy($request, 99999);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Abonné introuvable', $response->getData(true)['message']);
    }
}
