<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Utilisateur;
use App\Services\Image\ImageConverterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class EvenementControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock ImageConverterService
        $this->imageConverterMock = Mockery::mock(ImageConverterService::class);
        $this->app->instance(ImageConverterService::class, $this->imageConverterMock);
    }

    public function test_index_retourne_tous_les_evenements()
    {
        // Given
        Evenement::factory()->count(3)->create();

        // When
        $response = $this->getJson('/api/evenements');

        // Then
        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_index_filtre_par_statut()
    {
        // Given
        Evenement::factory()->create(['statut' => 'publie']);
        Evenement::factory()->create(['statut' => 'brouillon']);

        // When
        $response = $this->getJson('/api/evenements?statut=publie');

        // Then
        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['statut' => 'publie']);
    }

    public function test_show_retourne_un_evenement_avec_ses_relations()
    {
        // Given
        $evenement = Evenement::factory()->create();

        // When
        $response = $this->getJson("/api/evenements/{$evenement->id_evenement}");

        // Then
        $response->assertStatus(200)
            ->assertJsonFragment(['titre' => $evenement->titre]);
    }

    public function test_store_cree_un_evenement_et_son_formulaire()
    {
        // Given
        Storage::fake('public');
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        $this->imageConverterMock->shouldReceive('convertImageToWebp')->once()->andReturn(true);

        $data = [
            'titre' => 'Nouvel An',
            'description' => 'Fête de fin d\'année',
            'date_evenement' => '2025-12-31',
            'heure_debut' => '20:00',
            'heure_fin' => '05:00',
            'lieu' => 'Salle des fêtes',
            'statut' => 'publie',
            'image' => UploadedFile::fake()->image('evenement.jpg'),
            'taches' => json_encode([
                [
                    'nom_tache' => 'Sécurité',
                    'description' => 'Gérer les entrées',
                    'heure_debut_globale' => '19:00',
                    'heure_fin_globale' => '06:00',
                    'creneaux' => [
                        ['heure_debut' => '19:00', 'heure_fin' => '22:00', 'quota' => 2]
                    ]
                ]
            ])
        ];

        // When
        $response = $this->postJson('/api/evenements', $data);

        // Then
        $response->assertStatus(201);
        $this->assertDatabaseHas('evenements', ['titre' => 'Nouvel An']);
        $this->assertDatabaseHas('formulaires', ['nom_formulaire' => 'Formulaire - Nouvel An']);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Sécurité']);
        $this->assertDatabaseHas('creneaux', ['quota' => 2]);
    }

    public function test_update_modifie_l_evenement()
    {
        // Given
        $evenement = Evenement::factory()->create(['titre' => 'Ancien Titre']);
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        $data = array_merge($evenement->toArray(), ['titre' => 'Nouveau Titre']);

        // When
        $response = $this->putJson("/api/evenements/{$evenement->id_evenement}", $data);

        // Then
        $response->assertStatus(200);
        $this->assertDatabaseHas('evenements', ['titre' => 'Nouveau Titre']);
    }

    public function test_destroy_supprime_l_evenement_et_le_formulaire_associe()
    {
        // Given
        Storage::fake('public');
        $formulaire = Formulaire::factory()->create(['is_template' => false]);
        $evenement = Evenement::factory()->create(['id_formulaire' => $formulaire->id_formulaire, 'image_url' => '/storage/evenements/test.webp']);
        $admin = Utilisateur::factory()->create(['role' => 'administrateur']);
        $this->actingAs($admin, 'sanctum');

        // When
        $response = $this->deleteJson("/api/evenements/{$evenement->id_evenement}");

        // Then
        $response->assertStatus(200);
        $this->assertDatabaseMissing('evenements', ['id_evenement' => $evenement->id_evenement]);
        $this->assertDatabaseMissing('formulaires', ['id_formulaire' => $formulaire->id_formulaire]);
    }

    public function test_get_details_retourne_donnees_completes()
    {
        // Given
        $evenement = Evenement::factory()->create();

        // When
        $response = $this->getJson("/api/evenements/{$evenement->id_evenement}/details");

        // Then
        $response->assertStatus(200)
            ->assertJsonStructure([
                'id_evenement',
                'formulaire' => [
                    'taches'
                ]
            ]);
    }
}
