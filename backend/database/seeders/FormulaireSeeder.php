<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FormulaireSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('formulaires')->insert([
            [
                'nom_formulaire' => 'Inscription Kermesse 2025',
                'description' => 'Formulaire d\'inscription pour tenir les stands de la kermesse',
                'statut' => 'actif',
                'id_createur' => 1, // Admin
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_formulaire' => 'Bénévoles Vente de Gâteaux',
                'description' => 'Inscription des bénévoles pour la vente de gâteaux',
                'statut' => 'actif',
                'id_createur' => 2, // Marie Dupont
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'nom_formulaire' => 'Aide Sortie Scolaire',
                'description' => 'Accompagnateurs pour la sortie au musée',
                'statut' => 'cloture',
                'id_createur' => 2,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(2),
            ],
            [
                'nom_formulaire' => 'Marché de Noël',
                'description' => 'Bénévoles pour le marché de Noël de l\'école',
                'statut' => 'archive',
                'id_createur' => 3, // Pierre Martin
                'created_at' => now()->subDays(60),
                'updated_at' => now()->subDays(35),
            ],
        ]);
    }
}
