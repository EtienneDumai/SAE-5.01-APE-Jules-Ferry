<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Formulaire;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FormulaireControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_formulaires()
    {
        Formulaire::factory()->count(3)->create();

        $response = $this->getJson('/api/formulaires'); // Public access based on route check? Checking code again... 
        // Wait, route check says public for show, but index is not explicitly public in my previous read of routes/api.php?
        // Let's re-verify route. Assuming index might be protected or not defined as public. 
        // Actually looking at `routes/api.php` from previous turn: 
        // Public: show. Protected: apiResource implicity includes index.
        // So index IS protected.
        
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        
        $response = $this->getJson('/api/formulaires');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_show_returns_formulaire()
    {
        // Public route
        $formulaire = Formulaire::factory()->create();

        $response = $this->getJson("/api/formulaires/{$formulaire->id_formulaire}");

        $response->assertStatus(200)
                 ->assertJson(['id_formulaire' => $formulaire->id_formulaire]);
    }

    public function test_show_returns_404_if_formulaire_not_found()
    {
        $response = $this->getJson('/api/formulaires/999');

        $response->assertStatus(404);
    }

    public function test_store_creates_formulaire_with_taches_and_creneaux()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        $data = [
            'nom_formulaire' => 'Nouveau Formulaire',
            'description' => 'Description du formulaire',
            'statut' => 'actif',
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
                            'quota' => 5
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/formulaires', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('formulaires', ['nom_formulaire' => 'Nouveau Formulaire']);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Tache 1']);
        $this->assertDatabaseHas('creneaux', ['quota' => 5]);
    }

    public function test_update_updates_formulaire()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $data = [
            'nom_formulaire' => 'Formulaire Modifié',
            'description' => 'Description Modifiée',
            'statut' => 'actif'
        ];

        $response = $this->putJson("/api/formulaires/{$formulaire->id_formulaire}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('formulaires', ['nom_formulaire' => 'Formulaire Modifié']);
    }

    public function test_destroy_deletes_formulaire()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $response = $this->deleteJson("/api/formulaires/{$formulaire->id_formulaire}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('formulaires', ['id_formulaire' => $formulaire->id_formulaire]);
    }
}
