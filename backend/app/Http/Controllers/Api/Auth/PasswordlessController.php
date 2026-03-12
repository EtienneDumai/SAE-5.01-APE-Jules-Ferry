<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\MagicLinkEmail;

class PasswordlessController extends Controller
{
    public function requestLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::firstOrCreate(
            ['email' => $request->email],
            [
                'nom' => 'Parent', 
                'prenom' => 'Anonyme', 
                'role' => 'parent',
                'statut_compte' => 'actif'
            ]
        );

        // Crée une URL signée valable 2 heures
        $urlApi = URL::temporarySignedRoute(
            'auth.magic.verify', 
            now()->addHours(2), 
            ['id_utilisateur' => $user->id_utilisateur]
        );

        // On utilise urlencode() pour éviter que les caractères spéciaux de l'URL API ne cassent le lien
        $urlPourEmail = "http://localhost:4200/verification-lien?cible=" . urlencode($urlApi);

        // On envoie le mail HTML avec le lien vers Angular
        Mail::to($user->email)->send(new MagicLinkEmail($urlPourEmail));

        Log::info("Mail magique généré pour {$user->email}. Lien Front-end : " . $urlPourEmail);

        return response()->json([
            'message' => 'Lien de connexion généré (voir les logs ou la boîte mail)'
        ], 200);
    }

    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = Utilisateur::where('email', $request->email)->first();

        // Si l'utilisateur existe ET qu'il est admin ou membre du bureau
        if ($user && in_array(strtolower($user->role), ['administrateur', 'membre_bureau'])) {
            return response()->json(['action' => 'require_password']);
        }

        // Sinon (parent ou nouvel utilisateur)
        return response()->json(['action' => 'send_magic_link']);
    }

    public function verifyLink(Request $request, $id_utilisateur)
    {
        if (! $request->hasValidSignature()) {
            return response()->json(['message' => 'Lien invalide ou expiré.'], 401);
        }

        $user = Utilisateur::findOrFail($id_utilisateur);

        [$accessToken, $refreshToken] = $user->createTokensWithoutExpiration();

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => [
                'id_utilisateur' => $user->id_utilisateur,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ], 200);
    }
}