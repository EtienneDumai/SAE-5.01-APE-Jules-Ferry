<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\EvenementController;
use App\Http\Controllers\Api\ActualiteController;
use App\Http\Controllers\Api\InscriptionController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes - Publiques
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

// Événements
Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/evenements/{id}', [EvenementController::class, 'show']);

// Actualités
Route::get('/actualites', [ActualiteController::class, 'index']);
Route::get('/actualites/{id}', [ActualiteController::class, 'show']);

/*
|--------------------------------------------------------------------------
| API Routes - Protégées (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [LogoutController::class, 'logout']);
    Route::get('/user', function(Request $request) {
        return response()->json(['user' => $request->user()]);
    });

    // Inscriptions (CRUD)
    Route::post('/inscriptions', [InscriptionController::class, 'store']);
    Route::get('/inscriptions/mes-inscriptions', [InscriptionController::class, 'mesInscriptions']);
    Route::delete('/inscriptions/{id_creneau}', [InscriptionController::class, 'destroy']);
});