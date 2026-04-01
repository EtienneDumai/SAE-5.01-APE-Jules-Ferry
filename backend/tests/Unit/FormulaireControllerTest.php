<?php

/**
 * Fichier : backend/tests/Unit/FormulaireControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour FormulaireControllerTest.
 */

namespace Tests\Unit;

use App\Http\Controllers\Api\FormulaireController;
use App\Models\Creneau;
use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FormulaireControllerTest extends TestCase
{
    use RefreshDatabase;

    private FormulaireController $controller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->controller = new FormulaireController();
    }

    #[Test]
    public function should_return_all_formulaires_for_index(): void
    {
        // GIVEN
        Formulaire::factory()->count(3)->create();
        $request = Request::create('/api/formulaires', 'GET');

        // WHEN
        $response = $this->controller->index($request);

        // THEN
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertCount(3, $response->getData(true));
    }

    #[Test]
    public function should_return_filtered_templates_for_index_when_filters_are_provided(): void
    {
        // GIVEN
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'actif']);
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'archive']);
        Formulaire::factory()->create(['is_template' => false, 'statut' => 'actif']);

        $request = Request::create('/api/formulaires', 'GET', [
            'is_template' => '1',
            'statut' => 'actif',
        ]);

        // WHEN
        $response = $this->controller->index($request);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_template']);
        $this->assertSame('actif', $data[0]['statut']);
    }

    #[Test]
    public function should_return_formulaire_for_show_when_formulaire_exists(): void
    {
        // GIVEN
        $formulaire = Formulaire::factory()->create();
        $tache = Tache::factory()->create(['id_formulaire' => $formulaire->id_formulaire]);
        Creneau::factory()->create(['id_tache' => $tache->id_tache]);

        // WHEN
        $response = $this->controller->show($formulaire->id_formulaire);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame($formulaire->id_formulaire, $response->getData(true)['id_formulaire']);
    }

    #[Test]
    public function should_return_not_found_for_show_when_formulaire_does_not_exist(): void
    {
        // GIVEN
        $missingId = 999999;

        // WHEN
        $response = $this->controller->show($missingId);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Non trouve', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_created_response_for_store_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $request = Request::create('/api/formulaires', 'POST', [
            'nom_formulaire' => 'Nouveau Formulaire',
            'description' => 'Description du formulaire',
            'statut' => 'actif',
            'is_template' => true,
            'taches' => [
                [
                    'nom_tache' => 'Tache 1',
                    'description' => 'Desc Tache 1',
                    'heure_debut_globale' => '08:00',
                    'heure_fin_globale' => '12:00',
                    'creneaux' => [
                        [
                            'heure_debut' => '08:00',
                            'heure_fin' => '10:00',
                            'quota' => 5,
                        ],
                    ],
                ],
            ],
        ]);

        // WHEN
        $response = $this->controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertDatabaseHas('formulaires', [
            'nom_formulaire' => 'Nouveau Formulaire',
            'id_createur' => $user->id_utilisateur,
            'is_template' => 1,
        ]);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Tache 1']);
        $this->assertDatabaseHas('creneaux', ['quota' => 5]);
    }

    #[Test]
    public function should_return_updated_formulaire_for_update_when_data_is_valid(): void
    {
        // GIVEN
        $formulaire = Formulaire::factory()->create([
            'nom_formulaire' => 'Ancien Formulaire',
            'statut' => 'actif',
            'is_template' => false,
        ]);

        Tache::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'nom_tache' => 'Ancienne tache',
        ]);

        $request = Request::create("/api/formulaires/{$formulaire->id_formulaire}", 'PUT', [
            'nom_formulaire' => 'Formulaire Modifie',
            'description' => 'Description Modifiee',
            'statut' => 'archive',
            'is_template' => true,
            'taches' => [
                [
                    'nom_tache' => 'Nouvelle tache',
                    'description' => 'Nouvelle description',
                    'heure_debut_globale' => '09:00',
                    'heure_fin_globale' => '11:00',
                    'creneaux' => [
                        [
                            'heure_debut' => '09:00',
                            'heure_fin' => '10:00',
                            'quota' => 3,
                        ],
                    ],
                ],
            ],
        ]);

        // WHEN
        $response = $this->controller->update($request, $formulaire->id_formulaire);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertDatabaseHas('formulaires', [
            'id_formulaire' => $formulaire->id_formulaire,
            'nom_formulaire' => 'Formulaire Modifie',
            'statut' => 'archive',
            'is_template' => 1,
        ]);
        $this->assertDatabaseHas('taches', [
            'id_formulaire' => $formulaire->id_formulaire,
            'nom_tache' => 'Nouvelle tache',
        ]);
        $this->assertDatabaseMissing('taches', [
            'id_formulaire' => $formulaire->id_formulaire,
            'nom_tache' => 'Ancienne tache',
        ]);
    }

    #[Test]
    public function should_return_success_for_destroy_when_formulaire_exists(): void
    {
        // GIVEN
        $formulaire = Formulaire::factory()->create();

        // WHEN
        $response = $this->controller->destroy($formulaire->id_formulaire);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Supprime avec succes', $response->getData(true)['message']);
        $this->assertDatabaseMissing('formulaires', [
            'id_formulaire' => $formulaire->id_formulaire,
        ]);
    }
}
