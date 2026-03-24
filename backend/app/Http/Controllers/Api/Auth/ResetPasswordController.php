<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use App\Mail\ResetPasswordMail;

class ResetPasswordController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        // Par sécurité informatique on ne révèle pas clairement si un compte existe ou non aux bots (énumération).
        if (!$user) {
            return response()->json([
                'message' => 'Si cette adresse e-mail existe, un lien de réinitialisation a été envoyé.'
            ], 200);
        }

        // Vérification du rôle : seuls ceux utilisant un mot de passe peuvent procéder.
        if (!in_array(strtolower($user->role), ['administrateur', 'membre_bureau'])) {
            return response()->json([
                'message' => 'Ce type de compte utilise une connexion sans mot de passe (Magic Link). Veuillez vous connecter classiquement pour recevoir un lien de connexion.'
            ], 403);
        }

        // Génération d'un token aléatoire
        $token = Str::random(64);

        // Insertion ou mise à jour du token dans la table de base de données standard de Laravel
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => Carbon::now()
            ]
        );

        // Construction du lien pour le front-end
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');
        $resetUrl = rtrim($frontendUrl, '/') . '/reinitialiser-mot-de-passe?token=' . $token . '&email=' . urlencode($request->email);

        // Envoi de l'e-mail
        Mail::to($request->email)->send(new ResetPasswordMail($resetUrl));

        return response()->json([
            'message' => 'Si cette adresse e-mail existe, un lien de réinitialisation a été envoyé.'
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        // On cherche un matching (email + token)
        $resetRecord = DB::table('password_reset_tokens')->where('email', $request->email)->where('token', $request->token)->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Le jeton de réinitialisation est invalide ou l\'e-mail est incorrect.'
            ], 400);
        }

        // Vérifier que le jeton n'a pas expiré (valable 60 minutes)
        if (Carbon::parse($resetRecord->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Le jeton de réinitialisation a expiré.'
            ], 400);
        }

        // Trouver l'utilisateur et mettre à jour le mot de passe
        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        // Vérifier que le nouveau mot de passe n'est pas identique à l'actuel
        if (Hash::check($request->password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Le nouveau mot de passe ne peut pas être identique à l\'ancien.'
            ], 400);
        }

        $user->mot_de_passe = Hash::make($request->password);
        $user->save();

        // Réussite, on supprime le token pour la sécurité
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Votre mot de passe a été réinitialisé avec succès.'
        ], 200);
    }
}
