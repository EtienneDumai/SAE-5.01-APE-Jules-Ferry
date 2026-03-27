<?php

/**
 * Fichier : backend/tests/Unit/Images/ImageConverterTest.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier contient les tests unitaires pour ImageConverterTest.
 */

namespace Tests\Unit;

use App\Services\Image\ImageConverterService;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class ImageConverterTest extends TestCase
{
    protected ImageConverterService $imageService;
    protected string $tempsPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->imageService = new ImageConverterService();
        $this->tempsPath = sys_get_temp_dir() . '/test_image.webp';
    }

    protected function tearDown(): void
    {
        if (file_exists($this->tempsPath)) {
            unlink($this->tempsPath);
        }

        parent::tearDown();
    }

    #[Test]
    public function should_convert_jpeg_image_to_webp(): void
    {
        // GIVEN
        $fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        // WHEN
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);

        // THEN
        $this->assertTrue($result);
        $this->assertFileExists($this->tempsPath);
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
    }

    #[Test]
    public function should_convert_png_image_to_webp(): void
    {
        // GIVEN
        $fakeImage = UploadedFile::fake()->image('test.png', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        // WHEN
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);

        // THEN
        $this->assertTrue($result);
        $this->assertFileExists($this->tempsPath);
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
    }

    #[Test]
    public function should_convert_gif_image_to_webp(): void
    {
        // GIVEN
        $fakeImage = UploadedFile::fake()->image('test.gif', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        // WHEN
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath);

        // THEN
        $this->assertTrue($result);
        $this->assertFileExists($this->tempsPath);
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
    }

    #[Test]
    public function should_throw_exception_for_non_image_file(): void
    {
        // GIVEN
        $fakeFilePath = sys_get_temp_dir() . '/test.txt';
        file_put_contents($fakeFilePath, 'Ceci est un test.');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Impossible de lire les informations');

        // WHEN
        $this->imageService->convertImageToWebp($fakeFilePath, $this->tempsPath);
    }

    #[Test]
    public function should_throw_exception_for_missing_source_file(): void
    {
        // GIVEN
        $nonExistentPath = $this->tempsPath . '/non_existent_image.jpg';

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage("Le fichier source n'existe pas");

        // WHEN
        $this->imageService->convertImageToWebp($nonExistentPath, $this->tempsPath);
    }

    #[Test]
    public function should_convert_image_with_custom_quality(): void
    {
        // GIVEN
        $fakeImage = UploadedFile::fake()->image('test.jpg', 100, 100);
        $sourcePath = $fakeImage->getPathname();

        // WHEN
        $result = $this->imageService->convertImageToWebp($sourcePath, $this->tempsPath, 50);

        // THEN
        $this->assertTrue($result);
        $this->assertFileExists($this->tempsPath);
        $this->assertEquals('image/webp', mime_content_type($this->tempsPath));
    }
}
