<?php

/**
 * Fichier : backend/database/migrations/2025_12_08_212909_create_inscriptions_table.php
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
        Schema::create('inscriptions', function (Blueprint $table) {
            // clés étrangères (pour faire la clé primaire composite)
            $table->foreignId('id_utilisateur')
                  ->constrained('utilisateurs', 'id_utilisateur')
                  ->onDelete('cascade'); // si utilisateur suppr, supprimer ses inscriptions  
            $table->foreignId('id_creneau')
                  ->constrained('creneaux', 'id_creneau')
                  ->onDelete('cascade'); // si creneau supprimé, supprimer les inscriptions associées
            // Clé primaire composite
            $table->primary(['id_utilisateur', 'id_creneau']);
            // Attributs
            $table->text('commentaire')->nullable();
            $table->timestamps(); // created_at = date_inscription
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};