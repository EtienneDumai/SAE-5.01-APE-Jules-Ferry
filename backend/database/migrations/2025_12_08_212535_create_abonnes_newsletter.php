<?php

/**
 * Fichier : backend/database/migrations/2025_12_08_212535_create_abonnes_newsletter.php
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
        Schema::create('abonnes_newsletter', function (Blueprint $table) {
            $table->id('id_abonne'); // Clé primaire
            // Attributs
            $table->string('email', 100)->unique();
            $table->enum('statut', ['actif', 'desinscrit'])->default('actif');
            $table->timestamps(); // created_at = date_inscription
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnes_newsletter');
    }
};