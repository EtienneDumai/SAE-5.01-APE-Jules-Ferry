<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActualiteController;
use App\Http\Controllers\CreneauController;
use App\Http\Controllers\EvennementController;
use App\Http\Controllers\FormulaireController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\UtilisateurController;

Route::apiResource('actualites', ActualiteController::class);
Route::apiResource('creneaux', CreneauController::class);
