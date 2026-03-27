<?php

/**
 * Fichier : backend/tests/Unit/InscriptionControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour InscriptionControllerTest.
 */

namespace Tests\Unit;

use App\Http\Controllers\Api\InscriptionController;
use App\Models\Creneau;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Inscription;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class InscriptionControllerTest extends TestCase
{
    use RefreshDatabase;

    private InscriptionController $controller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->controller = new InscriptionController();
    }

    #[Test]
    public function should_return_all_inscriptions_for_index(): void
    {
        // GIVEN
        Inscription::factory()->count(2)->create();

        $request = Request::create('/api/inscriptions', 'GET');

        // WHEN
        $response = $this->controller->index($request);

        // THEN
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(2, $response->getData(true));
    }

    #[Test]
    public function should_return_created_response_for_store_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $request = $this->makeAuthenticatedRequest('POST', [
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Participation confirmee',
        ], $user);

        // WHEN
        $response = $this->controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Inscription validée !', $response->getData(true)['message']);
        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Participation confirmee',
        ]);
    }

    #[Test]
    public function should_return_conflict_for_store_when_user_is_already_registered(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
        ]);

        $request = $this->makeAuthenticatedRequest('POST', [
            'id_creneau' => $creneau->id_creneau,
        ], $user);

        // WHEN
        $response = $this->controller->store($request);

        // THEN
        $this->assertSame(409, $response->getStatusCode());
        $this->assertSame('Vous êtes déjà inscrit à ce créneau.', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_unprocessable_entity_for_store_when_event_is_past(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->subDay()->toDateString(), 5);

        $request = $this->makeAuthenticatedRequest('POST', [
            'id_creneau' => $creneau->id_creneau,
        ], $user);

        // WHEN
        $response = $this->controller->store($request);

        // THEN
        $this->assertSame(422, $response->getStatusCode());
        $this->assertSame(
            'Impossible de s\'inscrire à un événement passé.',
            $response->getData(true)['message']
        );
    }

    #[Test]
    public function should_return_user_inscriptions_for_mes_inscriptions(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();

        Inscription::factory()->count(3)->create([
            'id_utilisateur' => $user->id_utilisateur,
        ]);

        Inscription::factory()->create();

        $request = $this->makeAuthenticatedRequest('GET', [], $user);

        // WHEN
        $response = $this->controller->mesInscriptions($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(3, $response->getData(true));
    }

    #[Test]
    public function should_return_success_for_destroy_when_inscription_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $inscription = Inscription::factory()->create([
            'id_utilisateur' => $user->id_utilisateur,
        ]);

        $request = $this->makeAuthenticatedRequest('DELETE', [], $user);

        // WHEN
        $response = $this->controller->destroy($request, $inscription->id_creneau);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Inscription annulée.', $response->getData(true)['message']);
        $this->assertDatabaseMissing('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $inscription->id_creneau,
        ]);
    }

    #[Test]
    public function should_return_success_for_store_admin_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $creneau = $this->createCreneauForEvent(now()->addDay()->toDateString(), 5);

        $request = Request::create('/api/admin/inscriptions', 'POST', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Ajout admin',
        ]);

        // WHEN
        $response = $this->controller->storeAdmin($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Inscription ajoutée avec succès !', $response->getData(true)['message']);
        $this->assertDatabaseHas('inscriptions', [
            'id_utilisateur' => $user->id_utilisateur,
            'id_creneau' => $creneau->id_creneau,
            'commentaire' => 'Ajout admin',
        ]);
    }

    private function makeAuthenticatedRequest(string $method, array $data, Utilisateur $user): Request
    {
        $request = Request::create('/api/inscriptions', $method, $data);
        $request->setUserResolver(static fn () => $user);

        return $request;
    }

    private function createCreneauForEvent(string $eventDate, int $quota): Creneau
    {
        $formulaire = Formulaire::factory()->create();

        Evenement::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'date_evenement' => $eventDate,
        ]);

        $tache = Tache::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
        ]);

        return Creneau::factory()->create([
            'id_tache' => $tache->id_tache,
            'quota' => $quota,
        ]);
    }
}
