<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evennements', function (Blueprint $table) {
            $table->unsignedBigInteger('id_evenement')->autoIncrement();
            $table->string('titre');
            $table->string('description');
            $table->dateTime('date_evennement');
            $table->dateTime('heure_debut');
            $table->dateTime('heure_fin');
            $table->string('lieu');
            $table->string('image_url');
            $table->dateTime('date_creation');
            $table->enum('statut', ['brouillon', 'publie', 'termine','annule'])->default('brouillon');
            //relation à faire avec utilisateurs et formulaires plus tard
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evennements');
    }
};
