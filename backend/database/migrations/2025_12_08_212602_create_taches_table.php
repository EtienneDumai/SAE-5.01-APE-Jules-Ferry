<?php

/**
 * Fichier : backend/database/migrations/2025_12_08_212602_create_taches_table.php
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
        Schema::create('taches', function (Blueprint $table) {
            $table->id('id_tache'); // Clé primaire
            $table->string('nom_tache', 100);
            $table->text('description')->nullable();
            $table->time('heure_debut_globale');
            $table->time('heure_fin_globale');
            $table->foreignId('id_formulaire')
                  ->constrained('formulaires', 'id_formulaire')
                  ->onDelete('cascade'); // si formulaire supprimé, supprimer toutes ses taches
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taches');
    }
};