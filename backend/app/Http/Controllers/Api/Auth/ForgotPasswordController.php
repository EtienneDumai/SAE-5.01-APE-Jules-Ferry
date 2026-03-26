<?php
namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordEmail;

class ForgotPasswordController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::where('email', $request->email)
            ->whereIn('role', ['administrateur', 'membre_bureau'])
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Si cet email existe, un lien vous a été envoyé.']);
        }

        $token = Str::random(64);
        Cache::put('set_password_' . $user->id_utilisateur, $token, now()->addHours(24));

        $frontendUrl = env('FRONTEND_URL', 'http://localhost');
        $url = $frontendUrl . '/set-password?token=' . $token . '&id=' . $user->id_utilisateur;

        Mail::to($user->email)->send(new ForgotPasswordEmail($url, $user->prenom));
        
        return response()->json(['message' => 'Si cet email existe, un lien vous a été envoyé.']);
    }
}