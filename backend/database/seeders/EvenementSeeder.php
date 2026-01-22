<?php

namespace Database\Seeders;

use App\Services\Image\ImageConverterService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class EvenementSeeder extends Seeder
{
    protected $imageConverter;

    // Injection du service de conversion
    public function __construct(ImageConverterService $imageConverter)
    {
        $this->imageConverter = $imageConverter;
    }

    /**
     * Convertit et déplace l'image vers le storage public d'événements
     */
    private function copierEtConvertirImage($nomFichier)
    {
        if (!$nomFichier) return null;

        $sourcePath = database_path('seeders/images/evenements/' . $nomFichier);
        $destinationDir = storage_path('app/public/evenements');

        $nomFichierWebp = pathinfo($nomFichier, PATHINFO_FILENAME) . '_' . uniqid() . '.webp';
        $destinationPath = $destinationDir . '/' . $nomFichierWebp;

        if (File::exists($sourcePath)) {
            if (!File::isDirectory($destinationDir)) {
                File::makeDirectory($destinationDir, 0755, true);
            }

            try {
                $success = $this->imageConverter->convertImageToWebp($sourcePath, $destinationPath, 80);
                
                if ($success) {
                    return '/storage/evenements/' . $nomFichierWebp;
                }
            } catch (\Exception $e) {
                \Log::error("Erreur conversion EvenementSeeder: " . $e->getMessage());
                return null;
            }
        }
        return null;
    }

    public function run(): void
    {
        DB::table('evenements')->truncate();
        if (!Storage::disk('public')->exists('evenements')) {
            Storage::disk('public')->makeDirectory('evenements');
        }

        DB::table('evenements')->insert([
            [
                'titre' => 'Kermesse de l\'école ' . now()->year,
                'description' => 'Grande kermesse annuelle avec stands de jeux et spectacle.',
                'date_evenement' => now()->addMonths(3)->toDateString(), 
                'heure_debut' => '14:00:00',
                'heure_fin' => '18:00:00',
                'lieu' => 'Cour de l\'école Jules Ferry',
                'image_url' => $this->copierEtConvertirImage('kermesse.jpg'),
                'statut' => 'publie',
                'id_auteur' => 1,
                'id_formulaire' => 1, 
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'titre' => 'Vente de gâteaux',
                'description' => 'Vente pour financer les projets pédagogiques.',
                'date_evenement' => now()->addDays(10)->toDateString(),
                'heure_debut' => '16:30:00',
                'heure_fin' => '18:00:00',
                'lieu' => 'Hall de l\'école',
                'image_url' => $this->copierEtConvertirImage('gateau-classique-chocolat.jpg'),
                'statut' => 'publie',
                'id_auteur' => 2,
                'id_formulaire' => 2,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'titre' => 'Assemblée Générale APE',
                'description' => 'Réunion importante pour tous les parents.',
                'date_evenement' => now()->addWeeks(2)->toDateString(),
                'heure_debut' => '18:30:00',
                'heure_fin' => '20:00:00',
                'lieu' => 'Salle polyvalente',
                'image_url' => $this->copierEtConvertirImage('Assemble_generale.jpg'),
                'statut' => 'publie',
                'id_auteur' => 1,
                'id_formulaire' => null,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
            [
                'titre' => 'Sortie au Musée',
                'description' => 'Sortie scolaire CE2/CM1 toute la journée.',
                'date_evenement' => now()->subMonth()->toDateString(),
                'heure_debut' => '09:00:00',
                'heure_fin' => '16:00:00',
                'lieu' => 'Musée d\'Histoire Naturelle',
                'image_url' => $this->copierEtConvertirImage('Musee.jpg'),
                'statut' => 'publie',
                'id_auteur' => 2,
                'id_formulaire' => 3,
                'created_at' => now()->subMonths(2),
                'updated_at' => now()->subMonths(2),
            ],
            [
                'titre' => 'Marché de Noël passé',
                'description' => 'Souvenir du marché de noël.',
                'date_evenement' => now()->subMonths(6)->toDateString(),
                'heure_debut' => '15:00:00',
                'heure_fin' => '19:00:00',
                'lieu' => 'Préau',
                'image_url' => null,
                'statut' => 'termine',
                'id_auteur' => 3,
                'id_formulaire' => 4,
                'created_at' => now()->subMonths(7),
                'updated_at' => now()->subMonths(7),
            ],
            [
                'titre' => 'Brouillon - Carnaval',
                'description' => 'En cours de préparation.',
                'date_evenement' => now()->addMonths(6)->toDateString(),
                'heure_debut' => '14:00:00',
                'heure_fin' => '17:00:00',
                'lieu' => 'À définir',
                'image_url' => null,
                'statut' => 'brouillon',
                'id_auteur' => 1,
                'id_formulaire' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}