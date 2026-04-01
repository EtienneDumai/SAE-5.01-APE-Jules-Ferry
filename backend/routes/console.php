<?php

/**
 * Fichier : backend/routes/console.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier enregistre les commandes console et traitements planifiables du backend.
 * Il centralise les points d'entree utilises en ligne de commande par Laravel.
 */

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('evenements:update-statut')->daily();