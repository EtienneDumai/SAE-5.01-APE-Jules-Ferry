<?php

/**
 * Fichier : backend/tests/Feature/TacheControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour TacheControllerTest.
 */

namespace Tests\Feature;

use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TacheControllerTest extends TestCase
{
    use RefreshDatabase;

    private Utilisateur $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = Utilisateur::factory()->create();
    }

    #[Test]
    public function should_return_all_taches_for_index_endpoint(): void
    {
        // GIVEN
        Tache::factory()->count(3)->create();
        $this->actingAs($this->user, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/taches');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    #[Test]
    public function should_return_tache_for_show_endpoint_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create();
        $this->actingAs($this->user, 'sanctum');

        // WHEN
        $response = $this->getJson("/api/taches/{$tache->id_tache}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['id_tache' => $tache->id_tache]);
    }

    #[Test]
    public function should_return_not_found_for_show_endpoint_when_tache_does_not_exist(): void
    {
        // GIVEN
        $this->actingAs($this->user, 'sanctum');

        // WHEN
        $response = $this->getJson('/api/taches/99999');

        // THEN
        $response->assertStatus(404);
    }

    #[Test]
    public function should_create_tache_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $this->actingAs($this->user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $data = [
            'nom_tache' => 'Nouvelle Tache',
            'description' => 'Description de la tache',
            'heure_debut_globale' => '09:00',
            'heure_fin_globale' => '17:00',
            'id_formulaire' => $formulaire->id_formulaire,
        ];

        // WHEN
        $response = $this->postJson('/api/taches', $data);

        // THEN
        $response->assertStatus(201)
            ->assertJsonFragment(['nom_tache' => 'Nouvelle Tache']);

        $this->assertDatabaseHas('taches', ['nom_tache' => 'Nouvelle Tache']);
    }

    #[Test]
    public function should_update_tache_for_update_endpoint_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create();
        $this->actingAs($this->user, 'sanctum');

        $data = ['nom_tache' => 'Tache Modifiee'];

        // WHEN
        $response = $this->putJson("/api/taches/{$tache->id_tache}", $data);

        // THEN
        $response->assertStatus(200)
            ->assertJsonFragment(['nom_tache' => 'Tache Modifiee']);

        $this->assertDatabaseHas('taches', [
            'id_tache' => $tache->id_tache,
            'nom_tache' => 'Tache Modifiee',
        ]);
    }

    #[Test]
    public function should_delete_tache_for_destroy_endpoint_when_tache_exists(): void
    {
        // GIVEN
        $tache = Tache::factory()->create();
        $this->actingAs($this->user, 'sanctum');

        // WHEN
        $response = $this->deleteJson("/api/taches/{$tache->id_tache}");

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseMissing('taches', ['id_tache' => $tache->id_tache]);
    }
}
