<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TacheSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('taches')->insert([
            // Tâches pour le formulaire Kermesse (id_formulaire = 1)
            [
                'nom_tache' => 'Stand Pêche aux canards',
                'description' => 'Tenir le stand de pêche aux canards et gérer les prix',
                'heure_debut_globale' => '14:00:00',
                'heure_fin_globale' => '18:00:00',
                'id_formulaire' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_tache' => 'Stand Chamboule-tout',
                'description' => 'Animation du stand chamboule-tout',
                'heure_debut_globale' => '14:00:00',
                'heure_fin_globale' => '18:00:00',
                'id_formulaire' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_tache' => 'Buvette',
                'description' => 'Service à la buvette (boissons et snacks)',
                'heure_debut_globale' => '14:00:00',
                'heure_fin_globale' => '18:00:00',
                'id_formulaire' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_tache' => 'Stand Crêpes',
                'description' => 'Préparation et vente de crêpes',
                'heure_debut_globale' => '14:00:00',
                'heure_fin_globale' => '18:00:00',
                'id_formulaire' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_tache' => 'Tombola',
                'description' => 'Vente de tickets de tombola et tirage au sort',
                'heure_debut_globale' => '14:00:00',
                'heure_fin_globale' => '17:30:00',
                'id_formulaire' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            // Tâches pour le formulaire Vente de gâteaux (id_formulaire = 2)
            [
                'nom_tache' => 'Installation et préparation',
                'description' => 'Mise en place des tables et disposition des gâteaux',
                'heure_debut_globale' => '16:00:00',
                'heure_fin_globale' => '16:30:00',
                'id_formulaire' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'nom_tache' => 'Vente des gâteaux',
                'description' => 'Accueil des clients et vente',
                'heure_debut_globale' => '16:30:00',
                'heure_fin_globale' => '18:00:00',
                'id_formulaire' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'nom_tache' => 'Rangement',
                'description' => 'Nettoyage et rangement du stand',
                'heure_debut_globale' => '18:00:00',
                'heure_fin_globale' => '18:30:00',
                'id_formulaire' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            // Tâches pour le formulaire Sortie scolaire (id_formulaire = 3)
            [
                'nom_tache' => 'Accompagnement groupe A',
                'description' => 'Accompagner un groupe d\'élèves lors de la visite',
                'heure_debut_globale' => '09:00:00',
                'heure_fin_globale' => '16:00:00',
                'id_formulaire' => 3,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            [
                'nom_tache' => 'Accompagnement groupe B',
                'description' => 'Accompagner un groupe d\'élèves lors de la visite',
                'heure_debut_globale' => '09:00:00',
                'heure_fin_globale' => '16:00:00',
                'id_formulaire' => 3,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
        ]);
    }
}
