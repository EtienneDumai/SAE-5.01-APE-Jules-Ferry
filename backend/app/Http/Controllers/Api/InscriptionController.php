<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use App\Models\Creneau;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class InscriptionController extends Controller
{
    public function index(Request $request)
    {
        $inscriptions = Inscription::with(['creneau.tache.formulaire.evenements'])
            ->get();
        return response()->json($inscriptions);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_creneau' => 'required|exists:creneaux,id_creneau',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $creneauId = $request->id_creneau;

        return DB::transaction(function () use ($user, $creneauId, $request) {

            // Pour éviter l'erreur :
            // Call to unknown method: stdClass::estComplet()
            /** @var Creneau|null $creneau */
            $creneau = Creneau::with('tache.formulaire.evenements')
                ->where('id_creneau', $creneauId)
                ->lockForUpdate()
                ->first();

            if (!$creneau) {
                return response()->json(['message' => 'Créneau non trouvé.'], 404);
            }

            // Verif date evenement pas expirée
            $evenement = $creneau->tache->formulaire->evenements()->first();

            if ($evenement && $evenement->date_evenement < now()->toDateString()) {
                return response()->json([
                    'message' => 'Impossible de s\'inscrire à un événement passé.'
                ], 422);
            }

            // Verif quota, doublon et inscription
            $existe = Inscription::where('id_utilisateur', $user->id_utilisateur)
                ->where('id_creneau', $creneauId)
                ->exists();

            if ($existe) {
                return response()->json(['message' => 'Vous êtes déjà inscrit à ce créneau.'], 409);
            }

            if ($creneau->estComplet()) {
                return response()->json(['message' => 'Ce créneau est complet.'], 422);
            }

            Inscription::create([
                'id_utilisateur' => $user->id_utilisateur,
                'id_creneau' => $creneauId,
                'commentaire' => $request->commentaire
            ]);

            return response()->json(['message' => 'Inscription validée !'], 201);
        });
    }

    public function mesInscriptions(Request $request)
    {
        $user = $request->user();

        $inscriptions = Inscription::with(['creneau.tache.formulaire.evenements'])
            ->where('id_utilisateur', $user->id_utilisateur)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($inscriptions);
    }

    //desinscription
    public function destroy(Request $request, $id_creneau)
    {
        $user = $request->user();

        $deleted = Inscription::where('id_utilisateur', $user->id_utilisateur)
            ->where('id_creneau', $id_creneau)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Inscription annulée.']);
        }

        return response()->json(['message' => 'Inscription introuvable.'], 404);
    }

    public function destroyAdmin(Request $request)
    {
        $request->validate([
            'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
            'id_creneau' => 'required|exists:creneaux,id_creneau',
            'password' => 'required|string',
        ]);

        $admin = $request->user();
        if (!Hash::check($request->password, $admin->getAuthPassword())) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 403);
        }

        $deleted = Inscription::where('id_utilisateur', $request->id_utilisateur)
            ->where('id_creneau', $request->id_creneau)
            ->delete();

        if ($deleted) {
            // TODO: Envoyer un mail a l'utilisateur concerné
            return response()->json(['message' => 'Inscription supprimée par administrateur.']);
        }

        return response()->json(['message' => 'Inscription introuvable.'], 404);
    }

    // Créer une inscription par un administrateur
    public function storeAdmin(Request $request)
    {
        $request->validate([
            'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
            'id_creneau' => 'required|exists:creneaux,id_creneau',
            'password' => 'required|string',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $admin = $request->user();
        if (!Hash::check($request->password, $admin->getAuthPassword())) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 403);
        }

        $userId = $request->id_utilisateur;
        $creneauId = $request->id_creneau;

        return DB::transaction(function () use ($userId, $creneauId, $request) {

            // Pour éviter l'erreur :
            // Call to unknown method: stdClass::estComplet()
            /** @var Creneau|null $creneau */
            $creneau = Creneau::with('tache.formulaire.evenements')
                ->where('id_creneau', $creneauId)
                ->lockForUpdate()
                ->first();

            if (!$creneau) {
                return response()->json(['message' => 'Créneau non trouvé.'], 404);
            }

            // Verif quota, doublon et inscription
            $existe = Inscription::where('id_utilisateur', $userId)
                ->where('id_creneau', $creneauId)
                ->exists();

            if ($existe) {
                return response()->json(['message' => 'L\'utilisateur est déjà inscrit à ce créneau.'], 409);
            }

            if ($creneau->estComplet()) {
                return response()->json(['message' => 'Ce créneau est complet.'], 422);
            }

            Inscription::create([
                'id_utilisateur' => $userId,
                'id_creneau' => $creneauId,
                'commentaire' => $request->commentaire
            ]);

            return response()->json(['message' => 'Inscription ajoutée avec succès !'], 201);
        });
    }

    public function updateAdmin(Request $request)
    {
        $request->validate([
            'id_utilisateur' => 'required|exists:utilisateurs,id_utilisateur',
            'old_id_creneau' => 'required|exists:creneaux,id_creneau',
            'new_id_creneau' => 'required|exists:creneaux,id_creneau',
            'password' => 'required|string',
        ]);

        $admin = $request->user();
        if (!Hash::check($request->password, $admin->getAuthPassword())) {
            return response()->json(['message' => 'Mot de passe incorrect.'], 403);
        }

        return DB::transaction(function () use ($request) {
            $inscription = Inscription::where('id_utilisateur', $request->id_utilisateur)
                ->where('id_creneau', $request->old_id_creneau)
                ->first();

            if (!$inscription) {
                return response()->json(['message' => 'Inscription introuvable.'], 404);
            }

            /** @var Creneau|null $newCreneau */
            $newCreneau = Creneau::where('id_creneau', $request->new_id_creneau)
                ->lockForUpdate()
                ->first();

            if ($newCreneau->estComplet()) {
                return response()->json(['message' => 'Le nouveau créneau est complet.'], 422);
            }

            $exists = Inscription::where('id_utilisateur', $request->id_utilisateur)
                ->where('id_creneau', $request->new_id_creneau)
                ->exists();

            if ($exists) {
                return response()->json(['message' => 'L\'utilisateur est déjà inscrit à ce créneau.'], 409);
            }

            $inscription->id_creneau = $request->new_id_creneau;
            $inscription->save();

            // TODO: Envoyer un mail a l'utilisateur concerné
            return response()->json(['message' => 'Inscription modifiée avec succès.']);
        });
    }
}
