<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordlessController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\ActualiteController;
use App\Http\Controllers\Api\InscriptionController;
use App\Http\Controllers\Api\FormulaireController;
use App\Http\Controllers\Api\UtilisateurController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\CreneauController;
use App\Http\Controllers\Api\TacheController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes - Publiques
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login'])
    ->middleware('throttle:10,1'); // Limite à 10 tentatives par minute

Route::post('/check-email', [PasswordlessController::class, 'checkEmail']);
Route::post('/magic-link', [PasswordlessController::class, 'requestLink']);
Route::get('/verify-link/{id_utilisateur}', [PasswordlessController::class, 'verifyLink'])
    ->name('auth.magic.verify');


Route::post('/newsletter/subscribe', [NewsletterController::class, 'store']);

// Événements
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);
Route::get('/evenements/{id}/details', [EvenementController::class, 'getDetails']);

// Actualités
Route::get('/actualites', [ActualiteController::class, 'index']);
Route::get('/actualites/{id}', [ActualiteController::class, 'show']);
Route::post('/actualites', [ActualiteController::class, 'store']);
Route::put('/actualites/{id}', [ActualiteController::class, 'update']);
Route::delete('/actualites/{id}', [ActualiteController::class, 'destroy']);

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
    Route::get('/inscriptions', [InscriptionController::class, 'index']);
    Route::post('/inscriptions', [InscriptionController::class, 'store']);
    Route::get('/inscriptions/mes-inscriptions', [InscriptionController::class, 'mesInscriptions']);
    Route::delete('/inscriptions/{id_creneau}', [InscriptionController::class, 'destroy']);

    // Admin Inscriptions
    Route::put('/admin/inscriptions', [InscriptionController::class, 'updateAdmin']);
    Route::delete('/admin/inscriptions', [InscriptionController::class, 'destroyAdmin']);


    Route::post('/evenements', [EvenementController::class, 'store']);
    Route::put('/evenements/{evenement}', [EvenementController::class, 'update']);
    Route::delete('/evenements/{evenement}', [EvenementController::class, 'destroy']);

    Route::apiResource('creneaux', CreneauController::class);
    Route::get('/creneaux/tache/{tacheId}', [CreneauController::class, 'getCreneauxByTacheId']);
    Route::apiResource('formulaires', FormulaireController::class);
    Route::apiResource('taches', TacheController::class);
    Route::apiResource('utilisateurs', UtilisateurController::class);
});