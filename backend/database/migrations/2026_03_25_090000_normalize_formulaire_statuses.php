<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('formulaires')
            ->where('statut', 'cloture')
            ->update(['statut' => 'archive']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE formulaires MODIFY statut ENUM('actif', 'archive') NOT NULL DEFAULT 'actif'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE formulaires MODIFY statut ENUM('actif', 'archive', 'cloture') NOT NULL DEFAULT 'actif'");
        }
    }
};
