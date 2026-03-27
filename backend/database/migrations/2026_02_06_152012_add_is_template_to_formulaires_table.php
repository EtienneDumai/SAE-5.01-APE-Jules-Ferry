<?php

/**
 * Fichier : backend/database/migrations/2026_02_06_152012_add_is_template_to_formulaires_table.php
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
        Schema::table('formulaires', function (Blueprint $table) {
            // true = c'est un modèle générique créé par l'admin
            // false = c'est un formulaire concret lié à un événement
            $table->boolean('is_template')->default(false)->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('formulaires', function (Blueprint $table) {
            $table->dropColumn('is_template');
        });
    }
};