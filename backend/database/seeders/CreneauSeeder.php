<?php

/**
 * Fichier : backend/database/seeders/CreneauSeeder.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier insere des donnees initiales pour CreneauSeeder.
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CreneauSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('creneaux')->insert([
            // Créneaux pour "Stand Pêche aux canards" (id_tache = 1)
            [
                'heure_debut' => '14:00:00',
                'heure_fin' => '16:00:00',
                'quota' => 2,
                'id_tache' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '16:00:00',
                'heure_fin' => '18:00:00',
                'quota' => 2,
                'id_tache' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Créneaux pour "Stand Chamboule-tout" (id_tache = 2)
            [
                'heure_debut' => '14:00:00',
                'heure_fin' => '16:00:00',
                'quota' => 2,
                'id_tache' => 2,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '16:00:00',
                'heure_fin' => '18:00:00',
                'quota' => 2,
                'id_tache' => 2,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Créneaux pour "Buvette" (id_tache = 3)
            [
                'heure_debut' => '14:00:00',
                'heure_fin' => '15:30:00',
                'quota' => 3,
                'id_tache' => 3,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '15:30:00',
                'heure_fin' => '17:00:00',
                'quota' => 3,
                'id_tache' => 3,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '17:00:00',
                'heure_fin' => '18:00:00',
                'quota' => 2,
                'id_tache' => 3,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Créneaux pour "Stand Crêpes" (id_tache = 4)
            [
                'heure_debut' => '14:00:00',
                'heure_fin' => '16:00:00',
                'quota' => 2,
                'id_tache' => 4,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '16:00:00',
                'heure_fin' => '18:00:00',
                'quota' => 2,
                'id_tache' => 4,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Créneaux pour "Tombola" (id_tache = 5)
            [
                'heure_debut' => '14:00:00',
                'heure_fin' => '15:45:00',
                'quota' => 1,
                'id_tache' => 5,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'heure_debut' => '15:45:00',
                'heure_fin' => '17:30:00',
                'quota' => 1,
                'id_tache' => 5,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Créneaux pour "Installation et préparation" vente gâteaux (id_tache = 6)
            [
                'heure_debut' => '16:00:00',
                'heure_fin' => '16:30:00',
                'quota' => 2,
                'id_tache' => 6,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            // Créneaux pour "Vente des gâteaux" (id_tache = 7)
            [
                'heure_debut' => '16:30:00',
                'heure_fin' => '17:15:00',
                'quota' => 3,
                'id_tache' => 7,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'heure_debut' => '17:15:00',
                'heure_fin' => '18:00:00',
                'quota' => 3,
                'id_tache' => 7,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            // Créneaux pour "Rangement" (id_tache = 8)
            [
                'heure_debut' => '18:00:00',
                'heure_fin' => '18:30:00',
                'quota' => 2,
                'id_tache' => 8,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            // Créneaux pour "Accompagnement groupe A" (id_tache = 9)
            [
                'heure_debut' => '09:00:00',
                'heure_fin' => '16:00:00',
                'quota' => 3,
                'id_tache' => 9,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            // Créneaux pour "Accompagnement groupe B" (id_tache = 10)
            [
                'heure_debut' => '09:00:00',
                'heure_fin' => '16:00:00',
                'quota' => 3,
                'id_tache' => 10,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
        ]);
    }
}
