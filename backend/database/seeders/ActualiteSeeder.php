<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActualiteSeeder extends Seeder
{
    public function run(): void
    {
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
                'titre' => 'Prochaine kermesse : 15 juin 2025',
                'contenu' => 'Réservez votre journée ! La kermesse annuelle de l\'école aura lieu le samedi 15 juin 2025. Au programme : stands de jeux, tombola, restauration et bien plus encore. Nous avons besoin de bénévoles !',
                'image_url' => '/images/kermesse.jpg',
                'date_publication' => now()->subDays(10)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'titre' => 'Vente de gâteaux le 20 décembre',
                'contenu' => 'L\'APE organise une vente de gâteaux pour financer les projets pédagogiques. Tous les bénéfices iront directement aux classes.',
                'image_url' => null,
                'date_publication' => now()->subDays(5)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 2,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'titre' => 'Compte-rendu de la dernière réunion',
                'contenu' => 'Voici le résumé de la réunion du bureau de l\'APE qui s\'est tenue le 1er décembre 2025. Nous avons discuté des projets à venir et du budget.',
                'image_url' => null,
                'date_publication' => now()->subDays(3)->toDateString(),
                'statut' => 'publie',
                'id_auteur' => 3,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'titre' => 'Brouillon - Projet de carnaval',
                'contenu' => 'Article en cours de rédaction sur le projet de carnaval pour mars 2026.',
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
