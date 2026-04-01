<?php

/**
 * Fichier : backend/tests/Unit/TacheControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour TacheControllerTest.
 */

namespace Tests\Unit;

use App\Http\Controllers\Api\TacheController;
use App\Models\Formulaire;
use App\Models\Tache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TacheControllerTest extends TestCase
{
    use RefreshDatabase;

    private TacheController $controller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->controller = new TacheController();
    }

    #[Test]
    public function should_return_all_taches_for_index(): void
    {
        // GIVEN
        Tache::factory()->count(3)->create();

        // WHEN
        $response = $this->controller->index();

        // THEN
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(3, $response->getData(true));
    }

    #[Test]
    public function should_return_tache_for_show_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create();

        // WHEN
        $response = $this->controller->show($tache->id_tache);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($tache->id_tache, $response->getData(true)['id_tache']);
    }

    #[Test]
    public function should_return_not_found_for_show_when_tache_does_not_exist(): void
    {
        // GIVEN
        $missingId = 99999;

        // WHEN
        $response = $this->controller->show($missingId);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Tâche non trouvée', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_created_tache_for_store_when_data_is_valid(): void
    {
        // GIVEN
        $formulaire = Formulaire::factory()->create();
        $request = Request::create('/api/taches', 'POST', [
            'nom_tache' => 'Nouvelle Tache',
            'description' => 'Description de la tache',
            'heure_debut_globale' => '09:00',
            'heure_fin_globale' => '17:00',
            'id_formulaire' => $formulaire->id_formulaire,
        ]);

        // WHEN
        $response = $this->controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Nouvelle Tache', $response->getData(true)['nom_tache']);
        $this->assertDatabaseHas('taches', [
            'nom_tache' => 'Nouvelle Tache',
            'id_formulaire' => $formulaire->id_formulaire,
        ]);
    }

    #[Test]
    public function should_return_updated_tache_for_update_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create([
            'nom_tache' => 'Ancienne Tache',
        ]);

        $request = Request::create("/api/taches/{$tache->id_tache}", 'PUT', [
            'nom_tache' => 'Tache Modifiee',
        ]);

        // WHEN
        $response = $this->controller->update($request, $tache->id_tache);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Tache Modifiee', $response->getData(true)['nom_tache']);
        $this->assertDatabaseHas('taches', [
            'id_tache' => $tache->id_tache,
            'nom_tache' => 'Tache Modifiee',
        ]);
    }

    #[Test]
    public function should_return_not_found_for_update_when_tache_does_not_exist(): void
    {
        // GIVEN
        $missingId = 99999;
        $request = Request::create("/api/taches/{$missingId}", 'PUT', [
            'nom_tache' => 'Tache Modifiee',
        ]);

        // WHEN
        $response = $this->controller->update($request, $missingId);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Tâche non trouvée', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_success_for_destroy_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create();

        // WHEN
        $response = $this->controller->destroy($tache->id_tache);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Tâche supprimée', $response->getData(true)['message']);
        $this->assertDatabaseMissing('taches', [
            'id_tache' => $tache->id_tache,
        ]);
    }

    #[Test]
    public function should_return_not_found_for_destroy_when_tache_does_not_exist(): void
    {
        // GIVEN
        $missingId = 99999;

        // WHEN
        $response = $this->controller->destroy($missingId);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Tâche non trouvée', $response->getData(true)['message']);
    }
}
