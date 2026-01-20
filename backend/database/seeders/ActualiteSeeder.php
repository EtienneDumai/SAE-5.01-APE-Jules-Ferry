<?php

namespace Database\Seeders;

use App\Services\Image\ImageConverterService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ActualiteSeeder extends Seeder
{
    protected $imageConverter;

    // On injecte le service via le constructeur
    public function __construct(ImageConverterService $imageConverter)
    {
        $this->imageConverter = $imageConverter;
    }

    /**
     * Convertit et déplace l'image vers le storage public
     */
    private function copierEtConvertirImage($nomFichier)
    {
        if (!$nomFichier) return null;

        $sourcePath = database_path('seeders/images/actualites/' . $nomFichier);
        $destinationDir = storage_path('app/public/actualites');

        $nomFichierWebp = pathinfo($nomFichier, PATHINFO_FILENAME) . '_' . uniqid() . '.webp';
        $destinationPath = $destinationDir . '/' . $nomFichierWebp;

        if (File::exists($sourcePath)) {
            if (!File::isDirectory($destinationDir)) {
                File::makeDirectory($destinationDir, 0755, true);
            }

            try {
                $success = $this->imageConverter->convertImageToWebp($sourcePath, $destinationPath, 80);
                
                if ($success) {
                    return '/storage/actualites/' . $nomFichierWebp;
                }
            } catch (\Exception $e) {
                \Log::error("Erreur conversion Seeder: " . $e->getMessage());
                return null;
            }
        }
        return null;
    }

    public function run(): void
    {
        DB::table('actualites')->truncate();
        if (!Storage::disk('public')->exists('actualites')) {
            Storage::disk('public')->makeDirectory('actualites');
        }

        DB::table('actualites')->insert([
            [
                'titre' => 'Bienvenue sur le nouveau site de l\'APE',
                'contenu' => 'Nous sommes ravis de vous présenter le nouveau site internet de l\'Association des Parents d\'Élèves de l\'école Jules Ferry. Vous y trouverez toutes les informations importantes concernant la vie de l\'école et les événements à venir.',
                'image_url' => null,
                'date_publication' => now()->subDays(30)->toDateString(),
                'statut' => 'brouillon',
                'id_auteur' => 1,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            [
                'titre' => 'Fête de l\'écode : 15 juin 2025',
                'contenu' => 'Réservez votre journée ! La fête de l\'école aura lieu le samedi 15 juin 2025. Au programme : stands de jeux, tombola, restauration et bien plus encore. Nous avons besoin de bénévoles !',
                'image_url' => $this->copierEtConvertirImage('fete_de_l_ecole.jpg'),
                'date_publication' => now()->subDays(10)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'titre' => 'Sortie piscine',
                'contenu' => 'L\'APE organise une sortie piscine pour les enfants. N\'oubliez pas les maillots !.',
                'image_url' => $this->copierEtConvertirImage('piscine.jpg'),
                'date_publication' => now()->subDays(5)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'titre' => 'Projet de carnaval',
                'contenu' => 'Le carnaval pour est prévu pour mars 2026. Une grosse journée se prépare soyez présent',
                'image_url' => $this->copierEtConvertirImage('carnaval.jpg'),
                'date_publication' => now()->subDays(3)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 3,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'titre' => 'Compte-rendu de la dernière réunion',
                'contenu' => 'Voici le résumé de la réunion du bureau de l\'APE qui s\'est tenue le 1er décembre 2025. Nous avons discuté des projets à venir et du budget.',
                'image_url' => $this->copierEtConvertirImage('Reunion.jpg'),
                'date_publication' => now()->addDays(30)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}