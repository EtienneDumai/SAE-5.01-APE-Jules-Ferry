<?php

/**
 * Fichier : backend/tests/Feature/FormulaireControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour FormulaireControllerTest.
 */

namespace Tests\Feature;

use App\Models\Formulaire;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FormulaireControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_return_all_formulaires_for_index_endpoint(): void
    {
        // GIVEN
        Formulaire::factory()->count(3)->create();

        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/formulaires');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    #[Test]
    public function should_return_filtered_templates_for_index_endpoint_when_is_template_filter_is_provided(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        Formulaire::factory()->create(['is_template' => true, 'statut' => 'actif']);
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'archive']);
        Formulaire::factory()->count(2)->create(['is_template' => false]);

        // WHEN
        $response = $this->getJson('/api/formulaires?is_template=1');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    #[Test]
    public function should_return_filtered_active_templates_for_index_endpoint_when_all_filters_are_provided(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        Formulaire::factory()->create(['is_template' => true, 'statut' => 'actif']);
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'archive']);

        // WHEN
        $response = $this->getJson('/api/formulaires?is_template=1&statut=actif');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.statut', 'actif')
            ->assertJsonPath('0.is_template', true);
    }

    #[Test]
    public function should_return_formulaire_for_show_endpoint_when_formulaire_exists(): void
    {
        // GIVEN
        $formulaire = Formulaire::factory()->create();

        // WHEN
        $response = $this->getJson("/api/formulaires/{$formulaire->id_formulaire}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['id_formulaire' => $formulaire->id_formulaire]);
    }

    #[Test]
    public function should_return_not_found_for_show_endpoint_when_formulaire_does_not_exist(): void
    {
        // GIVEN
        $missingId = 999;

        // WHEN
        $response = $this->getJson("/api/formulaires/{$missingId}");

        // THEN
        $response->assertStatus(404);
    }

    #[Test]
    public function should_create_formulaire_with_taches_and_creneaux_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        $data = [
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
        ];

        // WHEN
        $response = $this->postJson('/api/formulaires', $data);

        // THEN
        $response->assertStatus(201);
        $this->assertDatabaseHas('formulaires', [
            'nom_formulaire' => 'Nouveau Formulaire',
            'is_template' => 1,
        ]);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Tache 1']);
        $this->assertDatabaseHas('creneaux', ['quota' => 5]);
    }

    #[Test]
    public function should_return_validation_errors_for_store_endpoint_when_statut_is_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        // WHEN
        $response = $this->postJson('/api/formulaires', [
            'nom_formulaire' => 'Statut invalide',
            'statut' => 'cloture',
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['statut']);
    }

    #[Test]
    public function should_update_formulaire_for_update_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $data = [
            'nom_formulaire' => 'Formulaire Modifie',
            'description' => 'Description Modifiee',
            'statut' => 'archive',
            'is_template' => true,
        ];

        // WHEN
        $response = $this->putJson("/api/formulaires/{$formulaire->id_formulaire}", $data);

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseHas('formulaires', [
            'nom_formulaire' => 'Formulaire Modifie',
            'statut' => 'archive',
            'is_template' => 1,
        ]);
    }

    #[Test]
    public function should_return_validation_errors_for_update_endpoint_when_statut_is_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        // WHEN
        $response = $this->putJson("/api/formulaires/{$formulaire->id_formulaire}", [
            'statut' => 'cloture',
        ]);

        // THEN
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['statut']);
    }

    #[Test]
    public function should_delete_formulaire_for_destroy_endpoint_when_formulaire_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        // WHEN
        $response = $this->deleteJson("/api/formulaires/{$formulaire->id_formulaire}");

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseMissing('formulaires', ['id_formulaire' => $formulaire->id_formulaire]);
    }
}
