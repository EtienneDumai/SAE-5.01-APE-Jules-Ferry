<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Evenement;
use App\Models\Utilisateur;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\Image\ImageConverterService;
use Mockery;
use Mockery\MockInterface;

class EvenementControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->instance(
            ImageConverterService::class,
            Mockery::mock(ImageConverterService::class, function (MockInterface $mock) {
                $mock->shouldReceive('convertImageToWebp')->andReturn(true);
            })
        );
    }

    public function test_index_retourne_tous_les_evenements()
    {
        Evenement::factory()->count(3)->create();

        $response = $this->getJson('/api/evenements');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_index_filtre_par_statut()
    {
        Evenement::factory()->create(['statut' => 'publie']);
        Evenement::factory()->create(['statut' => 'brouillon']);

        $response = $this->getJson('/api/evenements?statut=publie');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['statut' => 'publie']);
    }

    public function test_show_retourne_un_evenement()
    {
        $evenement = Evenement::factory()->create();

        $response = $this->getJson("/api/evenements/{$evenement->id_evenement}");

        $response->assertStatus(200)
                 ->assertJson(['id_evenement' => $evenement->id_evenement]);
    }

    public function test_show_retourne_404_si_evenement_non_trouve()
    {
        $response = $this->getJson('/api/evenements/999');

        $response->assertStatus(404);
    }

    public function test_store_cree_un_evenement()
    {
        Storage::fake('public');
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');

        $data = [
            'titre' => 'Nouvel événement',
            'description' => 'Description de l\'événement',
            'date_evenement' => '2024-12-25',
            'heure_debut' => '10:00',
            'heure_fin' => '12:00',
            'lieu' => 'Paris',
            'statut' => 'publie',
            'image' => UploadedFile::fake()->create('event.jpg', 100)
        ];

        $response = $this->postJson('/api/evenements', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('evenements', ['titre' => 'Nouvel événement']);
    }

    public function test_update_modifie_un_evenement()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');
        $evenement = Evenement::factory()->create();

        $data = [
            'titre' => 'Titre modifié',
            'description' => $evenement->description,
            'date_evenement' => $evenement->date_evenement->format('Y-m-d'),
            'heure_debut' => $evenement->heure_debut->format('H:i'),
            'heure_fin' => $evenement->heure_fin->format('H:i'),
            'lieu' => $evenement->lieu,
            'statut' => $evenement->statut,
        ];

        $response = $this->putJson("/api/evenements/{$evenement->id_evenement}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('evenements', ['titre' => 'Titre modifié']);
    }

    public function test_destroy_supprime_un_evenement()
    {
        $user = Utilisateur::factory()->create();
        $this->actingAs($user, 'sanctum');
        $evenement = Evenement::factory()->create();

        $response = $this->deleteJson("/api/evenements/{$evenement->id_evenement}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('evenements', ['id_evenement' => $evenement->id_evenement]);
    }
}
