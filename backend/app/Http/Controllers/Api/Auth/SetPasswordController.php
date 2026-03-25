<?php
namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class SetPasswordController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'id_utilisateur' => 'required|integer',
            'token'          => 'required|string',
            'mot_de_passe'   => 'required|string|min:8|confirmed',
        ]);
    
        $cacheKey = 'set_password_' . $request->id_utilisateur;
        $tokenStocke = Cache::get($cacheKey);

        if (!$tokenStocke || $tokenStocke !== $request->token) {
            return response()->json(['message' => 'Lien invalide ou expiré.'], 401);
        }

        $user = Utilisateur::findOrFail($request->id_utilisateur);
        $user->mot_de_passe = Hash::make($request->mot_de_passe);
        $user->save();

        Cache::forget($cacheKey);

        return response()->json(['message' => 'Mot de passe créé avec succès.']);
    }
}