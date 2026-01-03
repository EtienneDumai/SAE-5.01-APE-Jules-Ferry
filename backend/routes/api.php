<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ActualiteController;
use App\Http\Controllers\CreneauController;
use App\Http\Controllers\EvennementController;
use App\Http\Controllers\FormulaireController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\UtilisateurController;

Route::get('/evenements/{eventId}/creneaux', [CreneauController::class, 'getCreneauxByEventId']);
Route::get('/evenements/{id_evennement}/taches', [TacheController::class, 'getTachesByEvennement']);
Route::apiResource('actualites', ActualiteController::class);
Route::apiResource('creneaux', CreneauController::class);
Route::apiResource('evenements', EvennementController::class);
Route::apiResource('formulaires', FormulaireController::class);
Route::apiResource('inscriptions', InscriptionController::class);
Route::apiResource('taches', TacheController::class);
Route::apiResource('utilisateurs', UtilisateurController::class);
