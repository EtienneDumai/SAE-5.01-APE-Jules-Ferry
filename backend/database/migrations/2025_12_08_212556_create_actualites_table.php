<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('actualites', function (Blueprint $table) {
            $table->unsignedBigInteger('id_actualite')->autoIncrement();
            $table->string('titre');
            $table->string('contenu');
            $table->string('image_url');
            $table->dateTime('date_publication');
            $table->dateTime('date_creation');
            $table->enum('statut', ['brouillon', 'publie', 'archive'])->default('brouillon');
            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('utilisateurs')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actualites');
    }
};
