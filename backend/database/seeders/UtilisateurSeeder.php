<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('utilisateurs')->insert([
            [
                'nom' => 'Admin',
                'prenom' => 'Super',
                'email' => 'admin@ape-julesferry.fr',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'administrateur',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Dupont',
                'prenom' => 'Marie',
                'email' => 'marie.dupont@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'membre_bureau',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Martin',
                'prenom' => 'Pierre',
                'email' => 'pierre.martin@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'membre_bureau',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Bernard',
                'prenom' => 'Sophie',
                'email' => 'sophie.bernard@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Lague',
                'prenom' => 'Theo',
                'email' => 'theolague64@gmail.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Dubois',
                'prenom' => 'Jean',
                'email' => 'jean.dubois@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Moreau',
                'prenom' => 'Julie',
                'email' => 'julie.moreau@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Laurent',
                'prenom' => 'Thomas',
                'email' => 'thomas.laurent@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Simon',
                'prenom' => 'Emma',
                'email' => 'emma.simon@example.com',
                'mot_de_passe' => Hash::make('password123'),
                'role' => 'parent',
                'statut_compte' => 'suspendu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
