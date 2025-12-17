<?php
namespace App\Services;

use Exception;

class ImageConverterService
{
    /**
     * Convertit une image (JPEG/JPG, PNG, GIF) en WebP.
     * @param string $source Chemin de l'image source
     * @param string|null $destination Chemin de l'image de destination 
     * @param int $quality 0-100 Qualité de l'image WebP, par défaut 80
     * @return bool Vrai si la conversion a réussi, faux sinon
     * @throws Exception
     */
    function convertImageToWebp(string $source, string $destination, int $quality = 80): bool
{
    if (!file_exists($source)) {
        return false;
    }
    
    $info = @getimagesize($source);
    if ($info === false) {
        return false; 
    }

    $mime = $info['mime'];

    // Création de l'image source selon le type
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $image = imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $image = imagecreatefrompng($source);
            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);
            break;
        case 'image/gif':
            $image = imagecreatefromgif($source);
            if ($image) {
                imagepalettetotruecolor($image);
            }
            break;
        default:
            return false; // Format non supporté
    }
    if (!$image) {
        return false;
    }
    $result = imagewebp($image, $destination, $quality);

    return $result;
}
}
