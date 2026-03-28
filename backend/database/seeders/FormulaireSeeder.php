<?php

/**
 * Fichier : backend/database/seeders/FormulaireSeeder.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier insere des donnees initiales pour FormulaireSeeder.
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Creneau;

class FormulaireSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('formulaires')->insert([
            [
                'nom_formulaire' => 'Inscription Kermesse 2025',
                'description' => 'Formulaire d\'inscription pour tenir les stands de la kermesse',
                'statut' => 'actif',
                'is_template' => false, // pas un template
                'id_createur' => 1,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(15),
            ],
            [
                'nom_formulaire' => 'Bénévoles Vente de Gâteaux',
                'description' => 'Inscription des bénévoles pour la vente de gâteaux',
                'statut' => 'actif',
                'is_template' => false,
                'id_createur' => 2,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
        ]);

        // les templates pour tests
        $templateBuvette = Formulaire::create([
            'nom_formulaire' => 'Modèle - Buvette Standard',
            'description' => 'Structure classique : Installation + Service bar + Rangement',
            'statut' => 'actif',
            'is_template' => true, // template
            'id_createur' => 1
        ]);

        $tacheInstall = Tache::create([
            'nom_tache' => 'Installation Matériel',
            'heure_debut_globale' => '16:00',
            'heure_fin_globale' => '18:00',
            'id_formulaire' => $templateBuvette->id_formulaire
        ]);
        Creneau::create(['heure_debut' => '16:00', 'heure_fin' => '18:00', 'quota' => 5, 'id_tache' => $tacheInstall->id_tache]);

        $tacheService = Tache::create([
            'nom_tache' => 'Service Bar',
            'heure_debut_globale' => '18:00',
            'heure_fin_globale' => '22:00',
            'id_formulaire' => $templateBuvette->id_formulaire
        ]);
        Creneau::create(['heure_debut' => '18:00', 'heure_fin' => '20:00', 'quota' => 3, 'id_tache' => $tacheService->id_tache]);
        Creneau::create(['heure_debut' => '20:00', 'heure_fin' => '22:00', 'quota' => 3, 'id_tache' => $tacheService->id_tache]);


        $templateSecu = Formulaire::create([
            'nom_formulaire' => 'Modèle - Sécurité Entrée',
            'description' => 'Gestion des entrées et sorties',
            'statut' => 'actif',
            'is_template' => true, // template
            'id_createur' => 1
        ]);
        
        $tacheEntree = Tache::create([
            'nom_tache' => 'Contrôle Entrée',
            'heure_debut_globale' => '08:00',
            'heure_fin_globale' => '12:00',
            'id_formulaire' => $templateSecu->id_formulaire
        ]);
        Creneau::create(['heure_debut' => '08:00', 'heure_fin' => '12:00', 'quota' => 2, 'id_tache' => $tacheEntree->id_tache]);
    }
}