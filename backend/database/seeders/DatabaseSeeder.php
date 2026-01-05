<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ordre d'exécution important pour respecter les contraintes de clés étrangères
        $this->call([
            UtilisateurSeeder::class,
            AbonneNewsletterSeeder::class,
            FormulaireSeeder::class,
            ActualiteSeeder::class,
            EvenementSeeder::class,
            TacheSeeder::class,
            CreneauSeeder::class,
            InscriptionSeeder::class,
        ]);
    }
}
