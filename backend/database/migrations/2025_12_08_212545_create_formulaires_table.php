<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formulaires', function (Blueprint $table) {
            $table->id('id_formulaire'); // Clé primaire
            // Attributs
            $table->string('nom_formulaire', 100);
            $table->string('description', 255)->nullable();
            $table->enum('statut', ['actif', 'archive', 'cloture'])->default('actif');
            $table->foreignId('id_createur') //Clé étrangere vers utilisateurs
                  ->constrained('utilisateurs', 'id_utilisateur')
                  ->onDelete('restrict'); // empeche de supprimer un utilisateur qui a crée des formulaires
            $table->timestamps(); // created_at = date_creation
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formulaires');
    }
};