<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Image\ImageConverterService;
use Illuminate\Http\UploadedFile;
use RuntimeException;


class ImageConverterTest extends TestCase
{
    protected $imageService;
    protected $tempsPath;


    protected function setUp(): void
    {
        parent::setUp();
        $this->imageService = new ImageConverterService(); //Instance du service
        $this->tempsPath = sys_get_temp_dir() . '/test_image.webp';

    }

    protected function tearDown(): void
    {
        // Suppression de l'image temporaire après chaque test
        if (file_exists($this->tempsPath)) {
            unlink($this->tempsPath);
        }
        parent::tearDown();
    }

    /**
     * Teste si une image JPEG est correctement convertie en WebP.
     */
    public function test_devrait_convertir_une_image_jpeg_en_webp(): void
    {
        //Given
        // Créer une fausse image JPEG pour le test
        $fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        //When
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);

        //Then
        $this->assertTrue($result); //Fonction retourne true
        $this->assertFileExists($this->tempsPath); //Le fichier WebP existe
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath)); //Le fichier est bien en WebP
    }

    /**
     * Teste si une image PNG est correctement convertie en WebP.
     */
    public function test_devrait_convertir_une_image_png_en_webp(): void
    {
        //Given
        // Créer une fausse image PNG pour le test
        $fakeImage = UploadedFile::fake()->image('test.png', 100, 100);
        $sourcePath = $fakeImage->getPathname();        
        
        //When
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);   
        
        //Then
        $this->assertTrue($result); //Fonction retourne true
        $this->assertFileExists($this->tempsPath); //Le fichier WebP existe
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath)); //Le fichier est bien en WebP
    }

    /**
     * Teste si une image GIF est correctement convertie en WebP.
     */
    public function test_devrait_convertir_une_image_gif_en_webp(): void
    {
        //Given
        // Créer une fausse image GIF pour le test
        $fakeImage = UploadedFile::fake()->image('test.gif', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        //When
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);   
        
        //Then
        $this->assertTrue($result); //Fonction retourne true
        $this->assertFileExists($this->tempsPath); //Le fichier WebP existe
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath)); //Le fichier est bien en WebP
    }

    /**
     * Cas d'erreur : le fichier source n'est pas une image supportée
     */
    public function test_devrait_lever_une_exception_pour_un_fichier_non_image(): void
    {
        //Given
        $fakeFilePath = sys_get_temp_dir() . '/test.txt';
        file_put_contents($fakeFilePath, 'Ceci est un test.'); //Créer un faux fichier texte

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Impossible de lire les informations');

        $this->imageService->convertImageToWebp($fakeFilePath, $this->tempsPath);
    }

    /**
     * Cas d'erreur : le fichier source n'existe pas
     */
    public function test_devrait_lever_une_exception_pour_un_fichier_inexistant(): void
    {
        $nonExistentPath = $this->tempsPath . '/non_existent_image.jpg'; //Chemin vers un fichier qui n'existe pas

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Le fichier source n'existe pas");

        $this->imageService->convertImageToWebp($nonExistentPath, $this->tempsPath);
    }

    /**
     * Teste la conversion avec une qualité personnalisée
     */
    public function test_devrait_convertir_avec_qualite_personnalisee(): void
    {
        $fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath, 50);

        $this->assertTrue($result);
        $this->assertFileExists($this->tempsPath);
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
    }

}
