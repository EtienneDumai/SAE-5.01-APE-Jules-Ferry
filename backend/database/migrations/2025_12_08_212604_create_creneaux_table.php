<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('creneaux', function (Blueprint $table) {
            $table->id('id_creneau'); // Clé primaire
            $table->time('heure_debut'); 
            $table->time('heure_fin');
            $table->integer('quota')->unsigned(); // nb places > 0
            // FK
            $table->foreignId('id_tache')
                  ->constrained('taches', 'id_tache')
                  ->onDelete('cascade'); // si tache suppr alors creneaux suppr aussi
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('creneaux');
    }
};