<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use Illuminate\Http\Request;
use App\Http\Controllers\ActualiteController;
use App\Http\Controllers\CreneauController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\FormulaireController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\TacheController;
use App\Http\Controllers\UtilisateurController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques (pas besoin d'être connecté)
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Routes protégées (nécessitent un token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout']);
    
    // Route pour récupérer les infos de l'utilisateur connecté
    Route::get('/user', function(Request $request) {
        return response()->json([
            'user' => $request->user(),
        ]);
    });

    // Routes protégées pour la gestion
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/evenements', [EvenementController::class, 'store']);
        Route::put('/evenements/{evenement}', [EvenementController::class, 'update']);
        Route::delete('/evenements/{evenement}', [EvenementController::class, 'destroy']);
    });
    
    Route::apiResource('creneaux', CreneauController::class);
    Route::apiResource('formulaires', FormulaireController::class);
    Route::apiResource('inscriptions', InscriptionController::class);
    Route::apiResource('taches', TacheController::class);
    Route::apiResource('utilisateurs', UtilisateurController::class);
});

// Routes publiques
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::apiResource('actualites', ActualiteController::class);
