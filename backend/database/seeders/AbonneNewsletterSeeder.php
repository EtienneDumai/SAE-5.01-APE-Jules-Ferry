<?php

/**
 * Fichier : backend/database/seeders/AbonneNewsletterSeeder.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier insere des donnees initiales pour AbonneNewsletterSeeder.
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AbonneNewsletterSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('abonnes_newsletter')->insert([
            [
                'email' => 'parent1@example.com',
                'statut' => 'actif',
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            [
                'email' => 'parent2@example.com',
                'statut' => 'actif',
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(25),
            ],
            [
                'email' => 'parent3@example.com',
                'statut' => 'actif',
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(20),
            ],
            [
                'email' => 'parent4@example.com',
                'statut' => 'desinscrit',
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(5),
            ],
            [
                'email' => 'parent5@example.com',
                'statut' => 'actif',
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
        ]);
    }
}
