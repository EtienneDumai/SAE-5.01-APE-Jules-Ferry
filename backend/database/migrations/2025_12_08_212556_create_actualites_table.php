<?php

/**
 * Fichier : backend/database/migrations/2025_12_08_212556_create_actualites_table.php
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
        Schema::create('actualites', function (Blueprint $table) {
            $table->id('id_actualite'); // Clé primaire
            $table->string('titre', 150);
            $table->text('contenu');
            $table->string('image_url', 255)->nullable();
            $table->date('date_publication');
            $table->enum('statut', ['brouillon', 'publie', 'archive'])->default('brouillon');
            $table->foreignId('id_auteur') // Clé étrangère vers utilisateurs
                  ->constrained('utilisateurs', 'id_utilisateur')
                  ->onDelete('restrict');
            $table->timestamps(); // created_at = date_creation
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actualites');
    }
};