<?php

namespace Tests\Feature\Http\Controllers\Api;
use App\Models\Actualite;
use App\Models\User;
use App\Services\Image\ImageConverterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;


class ActualiteControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_index_retoune_les_actualites_publiees_ordonnee_par_date()
    {
        Actualite::factory()->create([
            'statut' => 'publie',
            'date_publication' => '2024-01-01'
        ]);
        Actualite::factory()->create([
            'statut' => 'publie',
            'date_publication' => '2024-01-02'
        ]);
        Actualite::factory()->create([
            'statut' => 'brouillon',
            'date_publication' => '2024-01-03'
        ]);

        $response = $this->getJson('/api/actualites');

        $response->assertStatus(200)
            ->assertJsonCount(2)
            ->assertJsonPath('0.date_publication', '2024-01-02');
    }

    public function test_show_retourne_actualite_lorsqu_elle_existe()
    {
        $actualite = Actualite::factory()->create(['titre' => 'Test Actualité']);

        $response = $this->getJson("/api/actualites/{$actualite->id_actualite}");

        $response->assertStatus(200)
            ->assertJsonPath('titre', 'Test Actualité');
    }

    public function test_show_retourne_404_lorsque_actualite_non_trouvee()
    {
        $response = $this->getJson('/api/actualites/999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Actualité non trouvée']);
    }

    public function test_store_cree_une_actualite_sans_image()
    {
        $auteur = \App\Models\Utilisateur::factory()->create();
        
        $data = [
            'titre' => 'Nouvelle Actualité',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur
        ];

        $response = $this->postJson('/api/actualites', $data);

        $response->assertStatus(201)
            ->assertJsonPath('titre', 'Nouvelle Actualité');
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouvelle Actualité']);
    }

    public function test_store_cree_une_actualite_avec_image()
    {
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $auteur = \App\Models\Utilisateur::factory()->create();
        $file = UploadedFile::fake()->image('test.jpg');

        $data = [
            'titre' => 'Actualité avec Image',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur,
            'image' => $file
        ];

        $response = $this->postJson('/api/actualites', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('actualites', ['titre' => 'Actualité avec Image']);
    }

    public function test_store_echoue_la_validation_avec_des_donnees_invalides()
    {
        $data = [
            'titre' => '',
            'statut' => 'invalid'
        ];

        $response = $this->postJson('/api/actualites', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['titre', 'contenu', 'date_publication', 'statut']);
    }

    public function test_update_modifie_une_actualite_existante()
    {
        $actualite = Actualite::factory()->create(['titre' => 'Ancien Titre']);

        $data = [
            'titre' => 'Nouveau Titre',
            'contenu' => 'Nouveau contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie'
        ];

        $response = $this->putJson("/api/actualites/{$actualite->id_actualite}", $data);

        $response->assertStatus(200)
            ->assertJsonPath('titre', 'Nouveau Titre');
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouveau Titre']);
    }

    public function test_update_remplace_l_image()
    {
        $this->mock(ImageConverterService::class, function ($mock) {
            $mock->shouldReceive('convertImageToWebp')->once();
        });

        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/old.webp'
        ]);

        $file = UploadedFile::fake()->image('new.jpg');

        $data = [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'image' => $file
        ];

        $response = $this->putJson("/api/actualites/{$actualite->id_actualite}", $data);

        $response->assertStatus(200);
        Storage::disk('public')->assertMissing('actualites/old.webp');
    }

    public function test_update_retourne_404_lorsque_actualite_non_trouvee()
    {
        $data = [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie'
        ];

        $response = $this->putJson('/api/actualites/999', $data);

        $response->assertStatus(404);
    }

    public function test_destroy_supprime_une_actualite_et_son_image()
    {
        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/test.webp'
        ]);
        Storage::disk('public')->put('actualites/test.webp', 'content');

        $response = $this->deleteJson("/api/actualites/{$actualite->id_actualite}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Actualité supprimée avec succès']);
        $this->assertDatabaseMissing('actualites', ['id_actualite' => $actualite->id_actualite]);
        Storage::disk('public')->assertMissing('actualites/test.webp');
    }

    public function test_destroy_retourne_404_lorsque_actualite_non_trouvee()
    {
        $response = $this->deleteJson('/api/actualites/999');

        $response->assertStatus(404);
    }
}