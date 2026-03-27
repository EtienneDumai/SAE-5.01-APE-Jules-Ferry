<?php

/**
 * Fichier : backend/routes/web.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier declare les routes web du backend.
 * Il regroupe les URL servies directement par Laravel en dehors de l'API principale.
 */

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
