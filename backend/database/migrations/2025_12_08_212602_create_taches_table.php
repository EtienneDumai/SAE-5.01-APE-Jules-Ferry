<?php

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
            $table->time('heure_debut_global');
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