<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EvenementSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('evenements')->insert([
            [
                'titre' => 'Kermesse de l\'école 2025',
                'description' => 'Grande kermesse annuelle de l\'école Jules Ferry avec stands de jeux, tombola, restauration et spectacle des enfants.',
                'date_evenement' => '2025-06-15',
                'heure_debut' => '14:00:00',
                'heure_fin' => '18:00:00',
                'lieu' => 'Cour de l\'école Jules Ferry',
                'image_url' => '/images/kermesse-2025.jpg',
                'statut' => 'publie',
                'id_auteur' => 1,
                'id_formulaire' => 1, // Formulaire d'inscription kermesse
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'titre' => 'Vente de gâteaux de Noël',
                'description' => 'Vente de gâteaux confectionnés par les parents pour financer les projets pédagogiques.',
                'date_evenement' => '2025-12-20',
                'heure_debut' => '16:30:00',
                'heure_fin' => '18:00:00',
                'lieu' => 'Hall de l\'école',
                'image_url' => null,
                'statut' => 'publie',
                'id_auteur' => 2,
                'id_formulaire' => 2, // Formulaire bénévoles vente de gâteaux
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'titre' => 'Sortie au Musée d\'Histoire Naturelle',
                'description' => 'Sortie scolaire pour les classes de CE2 et CM1. Besoin d\'accompagnateurs.',
                'date_evenement' => '2025-11-28',
                'heure_debut' => '09:00:00',
                'heure_fin' => '16:00:00',
                'lieu' => 'Musée d\'Histoire Naturelle',
                'image_url' => null,
                'statut' => 'termine',
                'id_auteur' => 2,
                'id_formulaire' => 3, // Formulaire aide sortie scolaire
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(18),
            ],
            [
                'titre' => 'Marché de Noël 2024',
                'description' => 'Marché de Noël organisé par l\'APE avec vente de créations artisanales et de produits gourmands.',
                'date_evenement' => '2024-12-14',
                'heure_debut' => '15:00:00',
                'heure_fin' => '19:00:00',
                'lieu' => 'Préau de l\'école',
                'image_url' => '/images/marche-noel-2024.jpg',
                'statut' => 'termine',
                'id_auteur' => 3,
                'id_formulaire' => 4, // Formulaire marché de Noël
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(32),
            ],
            [
                'titre' => 'Assemblée Générale de l\'APE',
                'description' => 'Assemblée générale annuelle de l\'association des parents d\'élèves. Tous les parents sont invités.',
                'date_evenement' => '2026-01-25',
                'heure_debut' => '18:30:00',
                'heure_fin' => '20:00:00',
                'lieu' => 'Salle polyvalente de l\'école',
                'image_url' => null,
                'statut' => 'publie',
                'id_auteur' => 1,
                'id_formulaire' => null, // Pas de formulaire d'inscription
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'titre' => 'Brouillon - Carnaval 2026',
                'description' => 'Projet de carnaval pour le printemps 2026. En cours de préparation.',
                'date_evenement' => '2026-03-20',
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
