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
        $request->validate([
            'email' => 'required|email',
            'nom' => 'nullable|string',
            'prenom' => 'nullable|string',
        ]);

        $user = Utilisateur::firstOrCreate(
            ['email' => $request->email],
            [
                'nom' => $request->nom ?? 'Inconnu',
                'prenom' => $request->prenom ?? 'Inconnu',
                'role' => 'parent',
                'statut_compte' => 'actif',
            ]
        );
        URL::forceScheme('https');
        // Crée une URL signée valable 2 heures (pour l'API)
        $urlApi = URL::temporarySignedRoute(
            'auth.magic.verify',
            now()->addHours(2),
            ['id_utilisateur' => $user->id_utilisateur]
        );
        $frontendUrl = env('FRONTEND_URL', 'http://localhost');

        // On construit le lien complet
        $urlPourEmail = $frontendUrl . "/verification-lien?cible=" . urlencode($urlApi);

        Mail::to($user->email)->send(new MagicLinkEmail($urlPourEmail));

        return response()->json([
            'message' => 'Lien de connexion généré (voir les logs ou la boîte mail)'
        ], 200);
    }

    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'action' => 'not_found',
                'message' => 'Aucun compte associé à cet email. Veuillez vous inscrire.'
            ]);
        }

        if ($user->statut_compte === 'desactive') {
            return response()->json([
                'action' => 'deactivated',
                'message' => 'Votre compte a été rendu inactif par l\'APE. Veuillez nous contacter pour plus d\'informations.'
            ]);
        }

        // Si l'utilisateur existe ET qu'il est admin ou membre du bureau
        if ($user && in_array(strtolower($user->role), ['administrateur', 'membre_bureau'])) {
            return response()->json(['action' => 'require_password']);
        }

        // Si le parent existe
        if ($user && $user->role === 'parent') {
            return response()->json(['action' => 'send_magic_link']);
        }

        return response()->json(['action' => 'not_found','message' => 'Aucun compte associé à cet email. Veuillez vous inscrire.']);
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
                'nom'            => $user->nom,
                'prenom'         => $user->prenom,
            ]
        ], 200);
    }
}
