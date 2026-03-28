<?php

/**
 * Fichier : backend/tests/Feature/CreneauControllerTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient un test feature (incrémentaux) pour CreneauControllerTest.
 */

namespace Tests\Feature;

use App\Models\Creneau;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CreneauControllerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function should_return_all_creneaux_for_index_endpoint(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        Creneau::factory()->count(3)->create();

        // WHEN
        $response = $this->getJson('/api/creneaux');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    #[Test]
    public function should_return_creneau_for_show_endpoint_when_creneau_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create();

        // WHEN
        $response = $this->getJson("/api/creneaux/{$creneau->id_creneau}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['id_creneau' => $creneau->id_creneau]);
    }

    #[Test]
    public function should_create_creneau_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create(['role' => 'parent']);
        $this->actingAs($user, 'sanctum');

        $tache = Tache::factory()->create();

        $data = [
            'heure_debut' => '08:00',
            'heure_fin' => '10:00',
            'quota' => 5,
            'id_tache' => $tache->id_tache,
        ];

        // WHEN
        $response = $this->postJson('/api/creneaux', $data);

        // THEN
        $response->assertStatus(201)
            ->assertJsonFragment(['quota' => 5]);

        $this->assertDatabaseHas('creneaux', [
            'heure_debut' => '08:00',
            'id_tache' => $tache->id_tache,
        ]);
    }

    #[Test]
    public function should_update_creneau_for_update_endpoint_when_creneau_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create(['quota' => 5]);

        $data = ['quota' => 10];

        // WHEN
        $response = $this->putJson("/api/creneaux/{$creneau->id_creneau}", $data);

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseHas('creneaux', [
            'quota' => 10,
            'id_creneau' => $creneau->id_creneau,
        ]);
    }

    #[Test]
    public function should_delete_creneau_for_destroy_endpoint_when_creneau_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create();

        // WHEN
        $response = $this->deleteJson("/api/creneaux/{$creneau->id_creneau}");

        // THEN
        $response->assertStatus(200);
        $this->assertDatabaseMissing('creneaux', ['id_creneau' => $creneau->id_creneau]);
    }

    #[Test]
    public function should_return_creneaux_for_get_creneaux_by_tache_id_endpoint_when_tache_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $tache = Tache::factory()->create();
        Creneau::factory()->count(2)->create(['id_tache' => $tache->id_tache]);
        Creneau::factory()->create();

        // WHEN
        $response = $this->getJson("/api/creneaux/tache/{$tache->id_tache}");

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(2);
    }
}
