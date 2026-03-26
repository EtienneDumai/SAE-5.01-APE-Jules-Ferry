<?php

namespace App\Services\Image;

use RuntimeException;

class ImageConverterService
{
    /**
     * Convertit une image (JPEG/JPG, PNG, GIF) en WebP.
     * 
     * @param string $source Chemin de l'image source
     * @param string $destination Chemin de l'image de destination 
     * @param int $quality 0-100 Qualité de l'image WebP, par défaut 80
     * @return bool Vrai si la conversion a réussi, faux sinon
     * @throws RuntimeException Si le fichier source n'existe pas ou si le format n'est pas supporté
     */
    public function convertImageToWebp(string $source, string $destination, int $quality = 80): bool
    {
        try {
            // Vérifier que le fichier source existe
            if (!file_exists($source)) {
                throw new RuntimeException("Le fichier source n'existe pas : $source");
            }

            // Récupérer les infos de l'image
            $info = @getimagesize($source);
            if ($info === false) {
                throw new RuntimeException("Impossible de lire les informations de l'image : $source");
            }

            $mime = $info['mime'];

            // Créer l'image source selon le type MIME
            switch ($mime) {
                case 'image/jpeg':
                case 'image/jpg':
                    $image = imagecreatefromjpeg($source);
                    break;
                case 'image/png':
                    $image = imagecreatefrompng($source);
                    if ($image) {
                        imagepalettetotruecolor($image);
                        imagealphablending($image, true);
                        imagesavealpha($image, true);
                    }
                    break;
                case 'image/gif':
                    $image = imagecreatefromgif($source);
                    if ($image) {
                        imagepalettetotruecolor($image);
                    }
                    break;
                case 'image/webp':
                    return copy($source, $destination);
                default:
                    throw new RuntimeException("Format non supporté : $mime");
            }

            if (!$image) {
                throw new RuntimeException("Impossible de créer l'image source : $source");
            }

            // Convertir en WebP
            $result = imagewebp($image, $destination, $quality);

            return $result !== false;
        } catch (RuntimeException $e) {
            throw $e;
        }
    }
}
