<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evenements', function (Blueprint $table) {
            $table->id('id_evenement'); // Clé primaire
            $table->string('titre', 150);
            $table->text('description');
            $table->date('date_evenement');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->string('lieu', 100);
            $table->string('image_url', 255)->nullable();
            $table->enum('statut', ['brouillon', 'publie', 'termine', 'annule'])->default('brouillon');

            // FK
            $table->foreignId('id_auteur')
                  ->constrained('utilisateurs', 'id_utilisateur')
                  ->onDelete('restrict');
            $table->foreignId('id_formulaire')
                  ->nullable() // un evenement peut ne pas avoir de formulaire (0,1)
                  ->constrained('formulaires', 'id_formulaire')
                  ->onDelete('set null'); // Si formulaire suppr, evenement reste mais formulaire devient null
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};