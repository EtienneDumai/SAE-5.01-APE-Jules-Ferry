<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\ActualiteController;
use App\Models\Actualite;
use App\Models\Utilisateur;
use App\Services\Image\ImageConverterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ActualiteControllerTest extends TestCase
{
    use RefreshDatabase;

    private ImageConverterService $imageConverter;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        $this->imageConverter = $this->mock(ImageConverterService::class);
    }

    #[Test]
    public function should_return_published_actualites_ordered_by_date_for_index(): void
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

        $controller = new ActualiteController($this->imageConverter);

        // WHEN
        $response = $controller->index();

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $data = $response->getData(true);
        $this->assertCount(2, $data);
        $this->assertSame('2024-01-02', $data[0]['date_publication']);
    }

    #[Test]
    public function should_return_actualite_for_show_when_actualite_exists(): void
    {
        // GIVEN
        $actualite = Actualite::factory()->create(['titre' => 'Test Actualite']);
        $controller = new ActualiteController($this->imageConverter);

        // WHEN
        $response = $controller->show($actualite->id_actualite);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Test Actualite', $response->getData(true)['titre']);
    }

    #[Test]
    public function should_return_not_found_for_show_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $controller = new ActualiteController($this->imageConverter);

        // WHEN
        $response = $controller->show(999);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Actualité non trouvée', $response->getData(true)['message']);
    }

    #[Test]
    public function should_return_created_actualite_for_store_when_data_is_valid_without_image(): void
    {
        // GIVEN
        $auteur = Utilisateur::factory()->create();
        $controller = new ActualiteController($this->imageConverter);
        $request = Request::create('/test', 'POST', [
            'titre' => 'Nouvelle Actualite',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur,
        ]);

        // WHEN
        $response = $controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Nouvelle Actualite', $response->getData(true)['titre']);
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouvelle Actualite']);
    }

    #[Test]
    public function should_return_created_actualite_for_store_when_data_is_valid_with_image(): void
    {
        // GIVEN
        $this->imageConverter
            ->shouldReceive('convertImageToWebp')
            ->once();

        $auteur = Utilisateur::factory()->create();
        $controller = new ActualiteController($this->imageConverter);
        $file = UploadedFile::fake()->image('test.jpg');

        $request = Request::create('/test', 'POST', [
            'titre' => 'Actualite avec Image',
            'contenu' => 'Contenu de test',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
            'id_auteur' => $auteur->id_utilisateur,
        ], [], [
            'image' => $file,
        ]);

        // WHEN
        $response = $controller->store($request);

        // THEN
        $this->assertSame(201, $response->getStatusCode());
        $this->assertSame('Actualite avec Image', $response->getData(true)['titre']);
        $this->assertNotNull($response->getData(true)['image_url']);
    }

    #[Test]
    public function should_return_updated_actualite_for_update_when_actualite_exists(): void
    {
        // GIVEN
        $actualite = Actualite::factory()->create(['titre' => 'Ancien Titre']);
        $controller = new ActualiteController($this->imageConverter);
        $request = Request::create('/test', 'PUT', [
            'titre' => 'Nouveau Titre',
            'contenu' => 'Nouveau contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
        ]);

        // WHEN
        $response = $controller->update($request, $actualite->id_actualite);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Nouveau Titre', $response->getData(true)['titre']);
        $this->assertDatabaseHas('actualites', ['titre' => 'Nouveau Titre']);
    }

    #[Test]
    public function should_replace_image_for_update_when_new_image_is_provided(): void
    {
        // GIVEN
        Storage::disk('public')->put('actualites/old.webp', 'content');

        $this->imageConverter
            ->shouldReceive('convertImageToWebp')
            ->once();

        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/old.webp',
        ]);

        $controller = new ActualiteController($this->imageConverter);
        $file = UploadedFile::fake()->image('new.jpg');

        $request = Request::create('/test', 'PUT', [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
        ], [], [
            'image' => $file,
        ]);

        // WHEN
        $response = $controller->update($request, $actualite->id_actualite);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        Storage::disk('public')->assertMissing('actualites/old.webp');
    }

    #[Test]
    public function should_return_not_found_for_update_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $controller = new ActualiteController($this->imageConverter);
        $request = Request::create('/test', 'PUT', [
            'titre' => 'Titre',
            'contenu' => 'Contenu',
            'date_publication' => '2024-01-01',
            'statut' => 'publie',
        ]);

        // WHEN
        $response = $controller->update($request, 999);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Actualité non trouvée', $response->getData(true)['message']);
    }

    #[Test]
    public function should_delete_actualite_and_image_for_destroy_when_actualite_exists(): void
    {
        // GIVEN
        Storage::disk('public')->put('actualites/test.webp', 'content');
        $actualite = Actualite::factory()->create([
            'image_url' => '/storage/actualites/test.webp',
        ]);
        $controller = new ActualiteController($this->imageConverter);

        // WHEN
        $response = $controller->destroy($actualite->id_actualite);

        // THEN
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('Actualité supprimée avec succès', $response->getData(true)['message']);
        $this->assertDatabaseMissing('actualites', ['id_actualite' => $actualite->id_actualite]);
        Storage::disk('public')->assertMissing('actualites/test.webp');
    }

    #[Test]
    public function should_return_not_found_for_destroy_when_actualite_does_not_exist(): void
    {
        // GIVEN
        $controller = new ActualiteController($this->imageConverter);

        // WHEN
        $response = $controller->destroy(999);

        // THEN
        $this->assertSame(404, $response->getStatusCode());
        $this->assertSame('Actualité non trouvée', $response->getData(true)['message']);
    }
}
