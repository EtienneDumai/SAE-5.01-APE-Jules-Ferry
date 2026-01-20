<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ActualiteSeeder extends Seeder
{
    private function copierImage($nomFichier)
    {
        if (!$nomFichier) return null;
        $sourcePath = database_path('seeders/images/actualites/' . $nomFichier);
        
        $destinationDir = storage_path('app/public/actualites');
        $destinationPath = $destinationDir . '/' . uniqid() . '_' . $nomFichier;
    
        if (File::exists($sourcePath)) {
            if (!File::isDirectory($destinationDir)) {
                File::makeDirectory($destinationDir, 0755, true);
            }
    
            if (File::copy($sourcePath, $destinationPath)) {
                return '/storage/actualites/' . basename($destinationPath);
            }
        }
        return null; 
    }

    public function run(): void
    {
        if (!Storage::disk('public')->exists('actualites')) {
            Storage::disk('public')->makeDirectory('actualites');
        }
        DB::table('actualites')->insert([
            [
                'titre' => 'Bienvenue sur le nouveau site de l\'APE',
                'contenu' => 'Nous sommes ravis de vous présenter le nouveau site internet de l\'Association des Parents d\'Élèves de l\'école Jules Ferry. Vous y trouverez toutes les informations importantes concernant la vie de l\'école et les événements à venir.',
                'image_url' => null,
                'date_publication' => now()->subDays(30)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 1,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            [
                'titre' => 'Fête de l\'écode : 15 juin 2025',
                'contenu' => 'Réservez votre journée ! La fête de l\'école aura lieu le samedi 15 juin 2025. Au programme : stands de jeux, tombola, restauration et bien plus encore. Nous avons besoin de bénévoles !',
                'image_url' =>$this->copierImage('fete_de_l_ecole.jpg'),
                'date_publication' => now()->subDays(10)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'titre' => 'Sortie piscine',
                'contenu' => 'L\'APE organise une sortie piscine pour les enfants. N\'oubliez pas les maillots !.',
                'image_url' =>$this->copierImage('piscine.jpg'),
                'date_publication' => now()->subDays(5)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'titre' => 'Projet de carnaval',
                'contenu' => 'Le carnaval pour est prévu pour mars 2026. Une grosse journée se prépare soyez présent',
                'image_url' =>$this->copierImage('carnaval.jpg'),
                'date_publication' => now()->subDays(3)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 3,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'titre' => 'Compte-rendu de la dernière réunion',
                'contenu' => 'Voici le résumé de la réunion du bureau de l\'APE qui s\'est tenue le 1er décembre 2025. Nous avons discuté des projets à venir et du budget.',
                'image_url' => null,
                'date_publication' => now()->addDays(30)->toDateString(),
                'statut' => 'brouillon',
                'id_auteur' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
