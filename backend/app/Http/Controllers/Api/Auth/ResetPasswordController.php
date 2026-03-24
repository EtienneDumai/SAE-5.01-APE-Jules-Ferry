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

        // Construction du lien vers le backend de manière dynamique
        $resetUrl = route('password.verify', [
            'token' => $token,
            'email' => $request->email
        ]);

        // Envoi de l'e-mail
        Mail::to($request->email)->send(new ResetPasswordMail($resetUrl));

        return response()->json([
            'message' => 'Si cette adresse e-mail existe, un lien de réinitialisation a été envoyé.'
        ], 200);
    }

    public function verifyTokenLink(Request $request)
    {
        $email = $request->query('email');
        $token = $request->query('token');

        if (!$email || !$token) {
            return response('<h1 style="text-align:center; font-family:sans-serif; margin-top:50px;">Ce lien est non valide.</h1>', 400)->header('Content-Type', 'text/html');
        }

        $resetRecord = DB::table('password_reset_tokens')->where('email', $email)->where('token', $token)->first();

        if (!$resetRecord) {
            return response('<h1 style="text-align:center; font-family:sans-serif; margin-top:50px; color:#d9534f;">Ce lien a déjà été utilisé ou est invalide.</h1>', 400)->header('Content-Type', 'text/html');
        }

        $createdAt = is_object($resetRecord) ? $resetRecord->created_at : $resetRecord['created_at'];
        if (Carbon::parse($createdAt)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response('<h1 style="text-align:center; font-family:sans-serif; margin-top:50px; color:#f0ad4e;">Ce lien de réinitialisation est expiré (15 min max).</h1>', 400)->header('Content-Type', 'text/html');
        }

        // Si tout est valide, on redirige vers le site frontend avec les tokens
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');
        return redirect(rtrim($frontendUrl, '/') . '/reinitialiser-mot-de-passe?token=' . $token . '&email=' . urlencode($email));
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => [
                'required',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/'
            ]
        ]);

        // On cherche un matching (email + token)
        $resetRecord = DB::table('password_reset_tokens')->where('email', $request->email)->where('token', $request->token)->first();

        if (!$resetRecord) {
            return response()->json([
                'message' => 'Le jeton de réinitialisation est invalide ou l\'e-mail est incorrect.'
            ], 400);
        }

        // Vérifier que le jeton n'a pas expiré (valable 15 minutes)
        $createdAt = is_object($resetRecord) ? $resetRecord->created_at : $resetRecord['created_at'];
        if (Carbon::parse($createdAt)->addMinutes(15)->isPast()) {
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
