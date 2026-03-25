<?php

namespace Tests\Feature;

use App\Models\Formulaire;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormulaireControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_retourne_tous_les_formulaires()
    {
        Formulaire::factory()->count(3)->create();

        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/formulaires');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_index_peut_filtrer_les_modeles_de_formulaire()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        Formulaire::factory()->create(['is_template' => true, 'statut' => 'actif']);
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'archive']);
        Formulaire::factory()->count(2)->create(['is_template' => false]);

        $response = $this->getJson('/api/formulaires?is_template=1');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_index_peut_filtrer_les_modeles_actifs()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        Formulaire::factory()->create(['is_template' => true, 'statut' => 'actif']);
        Formulaire::factory()->create(['is_template' => true, 'statut' => 'archive']);

        $response = $this->getJson('/api/formulaires?is_template=1&statut=actif');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.statut', 'actif')
            ->assertJsonPath('0.is_template', true);
    }

    public function test_show_retourne_un_formulaire()
    {
        $formulaire = Formulaire::factory()->create();

        $response = $this->getJson("/api/formulaires/{$formulaire->id_formulaire}");

        $response->assertStatus(200)
            ->assertJson(['id_formulaire' => $formulaire->id_formulaire]);
    }

    public function test_show_retourne_404_si_formulaire_non_trouve()
    {
        $response = $this->getJson('/api/formulaires/999');

        $response->assertStatus(404);
    }

    public function test_store_cree_formulaire_avec_taches_et_creneaux()
    {
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

        $response = $this->postJson('/api/formulaires', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('formulaires', ['nom_formulaire' => 'Nouveau Formulaire', 'is_template' => 1]);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Tache 1']);
        $this->assertDatabaseHas('creneaux', ['quota' => 5]);
    }

    public function test_store_refuse_le_statut_cloture()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/formulaires', [
            'nom_formulaire' => 'Statut invalide',
            'statut' => 'cloture',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['statut']);
    }

    public function test_update_modifie_un_formulaire()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $data = [
            'nom_formulaire' => 'Formulaire Modifie',
            'description' => 'Description Modifiee',
            'statut' => 'archive',
            'is_template' => true,
        ];

        $response = $this->putJson("/api/formulaires/{$formulaire->id_formulaire}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('formulaires', [
            'nom_formulaire' => 'Formulaire Modifie',
            'statut' => 'archive',
            'is_template' => 1,
        ]);
    }

    public function test_update_refuse_le_statut_cloture()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $response = $this->putJson("/api/formulaires/{$formulaire->id_formulaire}", [
            'statut' => 'cloture',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['statut']);
    }

    public function test_destroy_supprime_un_formulaire()
    {
        $user = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($user, 'sanctum');
        $formulaire = Formulaire::factory()->create();

        $response = $this->deleteJson("/api/formulaires/{$formulaire->id_formulaire}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('formulaires', ['id_formulaire' => $formulaire->id_formulaire]);
    }
}
