<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Tache;
use App\Models\Utilisateur;
use App\Models\Formulaire;

class TacheControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = Utilisateur::factory()->create();
    }

    public function test_index_retourne_toutes_les_taches()
    {
        Tache::factory()->count(3)->create();

        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson('/api/taches');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_show_retourne_une_tache()
    {
        $tache = Tache::factory()->create();

        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson("/api/taches/{$tache->id_tache}");

        $response->assertStatus(200)
            ->assertJson(['id_tache' => $tache->id_tache]);
    }

    public function test_show_retourne_404_si_tache_non_trouvee()
    {
        $this->actingAs($this->user, 'sanctum');

        $response = $this->getJson('/api/taches/99999');

        $response->assertStatus(404);
    }

    public function test_store_cree_une_tache()
    {
        $this->actingAs($this->user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $data = [
            'nom_tache' => 'Nouvelle Tâche',
            'description' => 'Description de la tâche',
            'heure_debut_globale' => '09:00',
            'heure_fin_globale' => '17:00',
            'id_formulaire' => $formulaire->id_formulaire
        ];

        $response = $this->postJson('/api/taches', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['nom_tache' => 'Nouvelle Tâche']);

        $this->assertDatabaseHas('taches', ['nom_tache' => 'Nouvelle Tâche']);
    }

    public function test_update_modifie_une_tache()
    {
        $tache = Tache::factory()->create();
        $this->actingAs($this->user, 'sanctum');

        $data = ['nom_tache' => 'Tâche Modifiée'];

        $response = $this->putJson("/api/taches/{$tache->id_tache}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['nom_tache' => 'Tâche Modifiée']);

        $this->assertDatabaseHas('taches', ['id_tache' => $tache->id_tache, 'nom_tache' => 'Tâche Modifiée']);
    }

    public function test_destroy_supprime_une_tache()
    {
        $tache = Tache::factory()->create();
        $this->actingAs($this->user, 'sanctum');

        $response = $this->deleteJson("/api/taches/{$tache->id_tache}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('taches', ['id_tache' => $tache->id_tache]);
    }
}
