<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\ActualiteController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\FormulaireController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\NewsletterController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes - Publiques
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'store']);

// Événements
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);

// Actualités
Route::get('/actualites', [ActualiteController::class, 'index']);
Route::get('/actualites/{id}', [ActualiteController::class, 'show']);

// Formulaires
Route::get('/formulaires/{id}', [FormulaireController::class, 'show']);

// Utilisateurs
Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);



/*
|--------------------------------------------------------------------------
| API Routes - Protégées (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });
    Route::patch('utilisateurs/{id}/mot-de-passe', [UtilisateurController::class, 'updatePassword']);

    // Inscriptions (CRUD)
    Route::post('/inscriptions', [InscriptionController::class, 'store']);
    Route::get('/inscriptions/mes-inscriptions', [InscriptionController::class, 'mesInscriptions']);
    

    Route::post('/evenements', [EvenementController::class, 'store']);
    Route::put('/evenements/{evenement}', [EvenementController::class, 'update']);
    Route::delete('/evenements/{evenement}', [EvenementController::class, 'destroy']);

    Route::apiResource('creneaux', CreneauController::class);
    Route::apiResource('formulaires', FormulaireController::class);
    Route::apiResource('inscriptions', InscriptionController::class);
    Route::apiResource('taches', TacheController::class);
    Route::apiResource('utilisateurs', UtilisateurController::class);
});
Route::delete('/inscriptions/{id_creneau}', [InscriptionController::class, 'destroy']);
// Routes publiques
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'show']);
Route::apiResource('actualites', ActualiteController::class);
