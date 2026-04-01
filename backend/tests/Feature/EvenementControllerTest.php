<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\Formulaire;
use App\Models\Utilisateur;
use App\Services\Image\ImageConverterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EvenementControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    #[Test]
    public function should_return_filtered_evenements_for_index_endpoint_when_statut_is_provided(): void
    {
        Evenement::factory()->create(['statut' => 'publie', 'date_evenement' => '2026-05-01']);
        Evenement::factory()->create(['statut' => 'brouillon', 'date_evenement' => '2026-05-02']);

        $response = $this->getJson('/api/evenements?statut=publie');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.statut', 'publie');
    }

    #[Test]
    public function should_return_paginated_evenements_for_index_endpoint_when_limit_is_provided(): void
    {
        Evenement::factory()->count(3)->create();

        $response = $this->getJson('/api/evenements?limit=2');

        $response->assertStatus(200)
            ->assertJsonPath('per_page', 2)
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function should_return_not_found_for_show_endpoint_when_evenement_does_not_exist(): void
    {
        $response = $this->getJson('/api/evenements/999999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Événement non trouvé']);
    }

    #[Test]
    public function should_return_evenement_details_for_get_details_endpoint_when_evenement_exists(): void
    {
        $evenement = Evenement::factory()->create();

        $response = $this->getJson("/api/evenements/{$evenement->id_evenement}/details");

        $response->assertStatus(200)
            ->assertJsonPath('id_evenement', $evenement->id_evenement);
    }

    #[Test]
    public function should_return_not_found_for_get_details_endpoint_when_evenement_does_not_exist(): void
    {
        $response = $this->getJson('/api/evenements/999999/details');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Événement non trouvé']);
    }

    #[Test]
    public function should_create_evenement_with_formulaire_taches_and_creneaux_for_store_endpoint(): void
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/evenements', [
            'titre' => 'Kermesse',
            'description' => 'Grande kermesse',
            'date_evenement' => '2026-06-20',
            'heure_debut' => '09:00',
            'heure_fin' => '18:00',
            'lieu' => 'Cour',
            'statut' => 'publie',
            'taches' => [
                [
                    'nom_tache' => 'Accueil',
                    'description' => 'Accueil des familles',
                    'heure_debut_globale' => '09:00',
                    'heure_fin_globale' => '12:00',
                    'creneaux' => [
                        ['heure_debut' => '09:00', 'heure_fin' => '10:00', 'quota' => 2],
                        ['heure_debut' => '10:00', 'heure_fin' => '11:00', 'quota' => 3],
                    ],
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('titre', 'Kermesse');

        $this->assertDatabaseHas('formulaires', [
            'nom_formulaire' => 'Formulaire - Kermesse',
            'id_createur' => $user->id_utilisateur,
        ]);
        $this->assertDatabaseHas('taches', ['nom_tache' => 'Accueil']);
        $this->assertDatabaseHas('creneaux', ['quota' => 2]);
    }

    #[Test]
    public function should_create_evenement_with_image_for_store_endpoint_when_file_is_provided(): void
    {
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/evenements', [
            'titre' => 'Concert',
            'description' => 'Concert de fin d année',
            'date_evenement' => '2026-06-10',
            'heure_debut' => '18:00',
            'heure_fin' => '20:00',
            'lieu' => 'Salle',
            'statut' => 'publie',
            'image' => UploadedFile::fake()->image('evenement.jpg'),
        ]);

        $response->assertStatus(201);
        $this->assertStringContainsString('/storage/evenements/', $response->json('image_url'));
    }

    #[Test]
    public function should_update_evenement_and_clear_formulaire_id_when_null_string_is_provided(): void
    {
        $user = Utilisateur::factory()->create();
        $formulaire = Formulaire::factory()->create();
        $evenement = Evenement::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'titre' => 'Ancien titre',
        ]);
        $this->actingAs($user, 'sanctum');

        $response = $this->putJson("/api/evenements/{$evenement->id_evenement}", [
            'titre' => 'Nouveau titre',
            'description' => 'Nouvelle description',
            'date_evenement' => '2026-06-11',
            'heure_debut' => '08:00',
            'heure_fin' => '09:00',
            'lieu' => 'Gymnase',
            'statut' => 'brouillon',
            'id_formulaire' => 'null',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('titre', 'Nouveau titre');

        $this->assertDatabaseHas('evenements', [
            'id_evenement' => $evenement->id_evenement,
            'titre' => 'Nouveau titre',
            'id_formulaire' => null,
        ]);
    }

    #[Test]
    public function should_replace_event_image_for_update_endpoint_when_new_image_is_provided(): void
    {
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $user = Utilisateur::factory()->create();
        $evenement = Evenement::factory()->create([
            'image_url' => '/storage/evenements/old.webp',
        ]);
        Storage::disk('public')->put('evenements/old.webp', 'content');
        $this->actingAs($user, 'sanctum');

        $response = $this->putJson("/api/evenements/{$evenement->id_evenement}", [
            'titre' => 'Titre image',
            'description' => 'Description image',
            'date_evenement' => '2026-06-12',
            'heure_debut' => '10:00',
            'heure_fin' => '11:00',
            'lieu' => 'Préau',
            'statut' => 'publie',
            'id_formulaire' => '',
            'image' => UploadedFile::fake()->image('new.jpg'),
        ]);

        $response->assertStatus(200);
        Storage::disk('public')->assertMissing('evenements/old.webp');
    }

    #[Test]
    public function should_return_not_found_for_update_endpoint_when_evenement_does_not_exist(): void
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $response = $this->putJson('/api/evenements/999999', [
            'titre' => 'Titre',
            'description' => 'Description',
            'date_evenement' => '2026-06-12',
            'heure_debut' => '10:00',
            'heure_fin' => '11:00',
            'lieu' => 'Préau',
            'statut' => 'publie',
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Non trouvé']);
    }

    #[Test]
    public function should_delete_evenement_formulaire_and_image_for_destroy_endpoint_when_password_is_valid(): void
    {
        $admin = Utilisateur::factory()->create([
            'role' => 'administrateur',
            'mot_de_passe' => Hash::make('password123'),
        ]);
        $formulaire = Formulaire::factory()->create(['is_template' => false]);
        $evenement = Evenement::factory()->create([
            'id_formulaire' => $formulaire->id_formulaire,
            'image_url' => '/storage/evenements/delete.webp',
        ]);
        Storage::disk('public')->put('evenements/delete.webp', 'content');

        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson("/api/evenements/{$evenement->id_evenement}", [
            'admin_password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Supprimé avec succès']);
        $this->assertDatabaseMissing('evenements', ['id_evenement' => $evenement->id_evenement]);
        $this->assertDatabaseMissing('formulaires', ['id_formulaire' => $formulaire->id_formulaire]);
        Storage::disk('public')->assertMissing('evenements/delete.webp');
    }

    #[Test]
    public function should_return_forbidden_for_destroy_endpoint_when_admin_password_is_invalid(): void
    {
        $admin = Utilisateur::factory()->create([
            'role' => 'administrateur',
            'mot_de_passe' => Hash::make('password123'),
        ]);
        $evenement = Evenement::factory()->create();

        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson("/api/evenements/{$evenement->id_evenement}", [
            'admin_password' => 'wrong',
        ]);

        $response->assertStatus(403)
            ->assertJson(['message' => 'Mot de passe administrateur incorrect.']);
    }

    #[Test]
    public function should_return_not_found_for_destroy_endpoint_when_evenement_does_not_exist(): void
    {
        $admin = Utilisateur::factory()->create();
        $this->actingAs($admin, 'sanctum');

        $response = $this->deleteJson('/api/evenements/999999', [
            'admin_password' => 'irrelevant',
        ]);

        $response->assertStatus(404)
            ->assertJson(['message' => 'Non trouvé']);
    }
}
