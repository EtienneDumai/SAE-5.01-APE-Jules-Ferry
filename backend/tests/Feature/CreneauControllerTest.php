<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Creneau;
use App\Models\Tache;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CreneauControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_retourne_tous_les_creneaux()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        Creneau::factory()->count(3)->create();

        $response = $this->getJson('/api/creneaux');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_show_retourne_un_creneau()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create();

        $response = $this->getJson("/api/creneaux/{$creneau->id_creneau}");

        $response->assertStatus(200)
                 ->assertJson(['id_creneau' => $creneau->id_creneau]);
    }

    public function test_store_cree_un_creneau()
    {
        $user = Utilisateur::factory()->create(['role' => 'parent']); // Assuming auth is optional for now or using actingAs to be safe
        $this->actingAs($user, 'sanctum');

        $tache = Tache::factory()->create();

        $data = [
            'heure_debut' => '08:00',
            'heure_fin' => '10:00',
            'quota' => 5,
            'id_tache' => $tache->id_tache
        ];

        $response = $this->postJson('/api/creneaux', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment(['quota' => 5]);
        
        $this->assertDatabaseHas('creneaux', [
            'heure_debut' => '08:00',
            'id_tache' => $tache->id_tache
        ]);
    }

    public function test_update_modifie_un_creneau()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create(['quota' => 5]);

        $data = ['quota' => 10];

        $response = $this->putJson("/api/creneaux/{$creneau->id_creneau}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('creneaux', ['quota' => 10, 'id_creneau' => $creneau->id_creneau]);
    }

    public function test_destroy_supprime_un_creneau()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $creneau = Creneau::factory()->create();

        $response = $this->deleteJson("/api/creneaux/{$creneau->id_creneau}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('creneaux', ['id_creneau' => $creneau->id_creneau]);
    }

    public function test_getCreneauxByTacheId_retourne_les_creneaux_pour_une_tache()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $tache = Tache::factory()->create();
        Creneau::factory()->count(2)->create(['id_tache' => $tache->id_tache]);
        Creneau::factory()->create();

        $response = $this->getJson("/api/creneaux/tache/{$tache->id_tache}");

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }
}
