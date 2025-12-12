<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('id_utilisateur'); // Clé primaire
            // Attributs
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('email', 100)->unique();
            $table->string('mot_de_passe', 255);
            $table->enum('role', ['parent', 'membre_bureau', 'administrateur'])->default('parent');
            $table->enum('statut_compte', ['actif', 'desactive', 'suspendu'])->default('actif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};