<?php

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
            $table->string('statut', 20)->default('actif'); // actif, désinscrit
            $table->timestamps(); // created_at = date_inscription
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnes_newsletter');
    }
};