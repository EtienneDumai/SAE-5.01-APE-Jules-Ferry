<?php

namespace Tests\Feature;

use App\Models\Actualite;
use App\Models\Utilisateur;
use App\Services\Image\ImageConverterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActualiteControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    #[Test]
    public function should_return_published_actualites_ordered_by_date_for_index_endpoint(): void
    {
        // GIVEN
        Actualite::factory()->create([
            'statut' => 'publie',
            'date_publication' => '2024-01-01',
        ]);
        Actualite::factory()->create([
            'statut' => 'publie',
            'date_publication' => '2024-01-02',
        ]);
        Actualite::factory()->create([
            'statut' => 'brouillon',
            'date_publication' => '2024-01-03',
        ]);

        // WHEN
        $response = $this->getJson('/api/actualites');

        // THEN
        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonPath('0.date_publication', '2024-01-02');
    }

    #[Test]
    public function should_return_actualite_for_show_endpoint_when_actualite_exists(): void
    {
        // GIVEN
        $actualite = Actualite::factory()->create(['titre' => 'Test Actualite']);

        // WHEN
        $response = $this->getJson("/api/actualites/{$actualite->id_actualite}");

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('titre', 'Test Actualite');
    }

    #[Test]
    public function should_return_not_found_for_show_endpoint_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $missingId = 999;

        // WHEN
        $response = $this->getJson("/api/actualites/{$missingId}");

        // THEN
        $response->assertStatus(404)
            ->assertJson(['message' => 'Actualité non trouvée']);
    }

    #[Test]
    public function should_create_actualite_without_image_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $auteur = Utilisateur::factory()->create();
        $data = [
            'titre' => 'Nouvelle Actualite',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur,
        ];

        // WHEN
        $response = $this->actingAs($auteur, 'sanctum')
                         ->postJson('/api/actualites', $data);

        // THEN
        $response->assertStatus(201)
            ->assertJsonPath('titre', 'Nouvelle Actualite');
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouvelle Actualite']);
    }

    #[Test]
    public function should_create_actualite_with_image_for_store_endpoint_when_data_is_valid(): void
    {
        // GIVEN
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $auteur = Utilisateur::factory()->create();
        $file = UploadedFile::fake()->image('test.jpg');

        $data = [
            'titre' => 'Actualite avec Image',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur,
            'image' => $file,
        ];

        // WHEN 
        $response = $this->actingAs($auteur, 'sanctum')
                         ->postJson('/api/actualites', $data);

        // THEN
        $response->assertStatus(201);
        $this->assertDatabaseHas('actualites', ['titre' => 'Actualite avec Image']);
    }

    #[Test]
    public function should_return_validation_errors_for_store_endpoint_when_data_is_invalid(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $data = [
            'titre' => '',
            'statut' => 'invalid',
        ];

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/actualites', $data);

        // THEN
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['titre', 'contenu', 'date_publication', 'statut']);
    }

    #[Test]
    public function should_update_actualite_for_update_endpoint_when_actualite_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $actualite = Actualite::factory()->create(['titre' => 'Ancien Titre']);
        $data = [
            'titre' => 'Nouveau Titre',
            'contenu' => 'Nouveau contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
        ];

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->putJson("/api/actualites/{$actualite->id_actualite}", $data);

        // THEN
        $response->assertStatus(200)
            ->assertJsonPath('titre', 'Nouveau Titre');
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouveau Titre']);
    }

    #[Test]
    public function should_replace_image_for_update_endpoint_when_new_image_is_provided(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/old.webp',
        ]);
        Storage::disk('public')->put('actualites/old.webp', 'content');
        $file = UploadedFile::fake()->image('new.jpg');

        $data = [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'image' => $file,
        ];

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->putJson("/api/actualites/{$actualite->id_actualite}", $data);

        // THEN
        $response->assertStatus(200);
        Storage::disk('public')->assertMissing('actualites/old.webp');
    }

    #[Test]
    public function should_return_not_found_for_update_endpoint_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $data = [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
        ];

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->putJson('/api/actualites/999', $data);

        // THEN
        $response->assertStatus(404);
    }

    #[Test]
    public function should_delete_actualite_and_image_for_destroy_endpoint_when_actualite_exists(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/test.webp',
        ]);
        Storage::disk('public')->put('actualites/test.webp', 'content');

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->deleteJson("/api/actualites/{$actualite->id_actualite}");

        // THEN
        $response->assertStatus(200)
            ->assertJson(['message' => 'Actualité supprimée avec succès']);
        $this->assertDatabaseMissing('actualites', ['id_actualite' => $actualite->id_actualite]);
        Storage::disk('public')->assertMissing('actualites/test.webp');
    }

    #[Test]
    public function should_return_not_found_for_destroy_endpoint_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $user = Utilisateur::factory()->create();
        $missingId = 999;

        // WHEN
        $response = $this->actingAs($user, 'sanctum')
                         ->deleteJson("/api/actualites/{$missingId}");

        // THEN
        $response->assertStatus(404);
    }
}