<?php

/**
 * Fichier : backend/database/migrations/2025_12_08_212523_create_utilisateurs_table.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier decrit une evolution de la base de donnees.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('id_utilisateur'); // Clé primaire
            // Attributs
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('email', 100)->unique();
            $table->string('mot_de_passe', 255)->nullable();
            $table->enum('role', ['parent', 'membre_bureau', 'administrateur'])->default('parent');
            $table->enum('statut_compte', ['actif', 'desactive'])->default('actif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};