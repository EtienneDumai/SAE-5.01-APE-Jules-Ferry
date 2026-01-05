<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InscriptionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('inscriptions')->insert([
            // Inscriptions pour la Kermesse
            // Sophie Bernard (id=4) s'inscrit au Stand Pêche aux canards créneaux 1
            [
                'id_utilisateur' => 4,
                'id_creneau' => 1,
                'commentaire' => 'Disponible tout l\'après-midi si besoin',
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(12),
            ],
            // Jean Dubois (id=5) s'inscrit au Stand Pêche aux canards créneau 1
            [
                'id_utilisateur' => 5,
                'id_creneau' => 1,
                'commentaire' => null,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            // Julie Moreau (id=6) s'inscrit au Stand Pêche aux canards créneau 2
            [
                'id_utilisateur' => 6,
                'id_creneau' => 2,
                'commentaire' => null,
                'created_at' => now()->subDays(11),
                'updated_at' => now()->subDays(11),
            ],
            // Thomas Laurent (id=7) s'inscrit au Stand Chamboule-tout créneau 1
            [
                'id_utilisateur' => 7,
                'id_creneau' => 3,
                'commentaire' => null,
                'created_at' => now()->subDays(9),
                'updated_at' => now()->subDays(9),
            ],
            // Sophie Bernard s'inscrit aussi à la Buvette créneau 1
            [
                'id_utilisateur' => 4,
                'id_creneau' => 5,
                'commentaire' => null,
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
            // Jean Dubois s'inscrit à la Buvette créneau 1
            [
                'id_utilisateur' => 5,
                'id_creneau' => 5,
                'commentaire' => 'J\'ai de l\'expérience en service',
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
            // Julie Moreau s'inscrit au Stand Crêpes créneau 1
            [
                'id_utilisateur' => 6,
                'id_creneau' => 8,
                'commentaire' => 'Je peux apporter ma crêpière',
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],
            // Thomas Laurent s'inscrit à la Tombola
            [
                'id_utilisateur' => 7,
                'id_creneau' => 10,
                'commentaire' => null,
                'created_at' => now()->subDays(6),
                'updated_at' => now()->subDays(6),
            ],

            // Inscriptions pour la Vente de gâteaux
            // Sophie Bernard s'inscrit à l'Installation
            [
                'id_utilisateur' => 4,
                'id_creneau' => 12,
                'commentaire' => null,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            // Julie Moreau s'inscrit à l'Installation
            [
                'id_utilisateur' => 6,
                'id_creneau' => 12,
                'commentaire' => 'J\'apporte des nappes décorées',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            // Jean Dubois s'inscrit à la Vente créneau 1
            [
                'id_utilisateur' => 5,
                'id_creneau' => 13,
                'commentaire' => null,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
            ],
            // Thomas Laurent s'inscrit à la Vente créneau 2
            [
                'id_utilisateur' => 7,
                'id_creneau' => 14,
                'commentaire' => null,
                'created_at' => now()->subDays(4),
                'updated_at' => now()->subDays(4),
            ],
            // Julie Moreau s'inscrit au Rangement
            [
                'id_utilisateur' => 6,
                'id_creneau' => 15,
                'commentaire' => null,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],

            // Inscriptions pour la Sortie scolaire (événement terminé)
            // Sophie Bernard s'est inscrite au groupe A
            [
                'id_utilisateur' => 4,
                'id_creneau' => 16,
                'commentaire' => 'J\'ai un grand véhicule pour transporter les enfants',
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(25),
            ],
            // Jean Dubois s'est inscrit au groupe A
            [
                'id_utilisateur' => 5,
                'id_creneau' => 16,
                'commentaire' => null,
                'created_at' => now()->subDays(24),
                'updated_at' => now()->subDays(24),
            ],
            // Julie Moreau s'est inscrite au groupe B
            [
                'id_utilisateur' => 6,
                'id_creneau' => 17,
                'commentaire' => null,
                'created_at' => now()->subDays(23),
                'updated_at' => now()->subDays(23),
            ],
            // Thomas Laurent s'est inscrit au groupe B
            [
                'id_utilisateur' => 7,
                'id_creneau' => 17,
                'commentaire' => 'Ravi de participer',
                'created_at' => now()->subDays(22),
                'updated_at' => now()->subDays(22),
            ],
        ]);
    }
}
