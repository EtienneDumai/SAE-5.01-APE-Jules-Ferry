<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Creneau;
use App\Models\Formulaire;
use App\Models\Tache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FormulaireController extends Controller
{
    public function index(Request $request)
    {
        $query = Formulaire::with('taches.creneaux');

        if ($request->has('is_template')) {
            $query->where('is_template', $request->boolean('is_template'));
        }

        if ($request->filled('statut')) {
            $query->where('statut', (string) $request->string('statut'));
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        try {
            $formulaire = Formulaire::with([
                'taches.creneaux' => function ($query) {
                    $query->withCount('inscriptions')->with('inscriptions');
                }
            ])->find($id);

            if (!$formulaire) {
                return response()->json(['message' => 'Non trouve'], 404);
            }

            return response()->json($formulaire);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_formulaire' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'statut' => 'nullable|in:actif,archive',
            'is_template' => 'nullable|boolean',
        ]);

        $userId = Auth::id() ?? 1;

        return DB::transaction(function () use ($request, $validated, $userId) {
            $formulaire = Formulaire::create([
                'nom_formulaire' => $validated['nom_formulaire'],
                'description' => $validated['description'] ?? null,
                'statut' => $validated['statut'] ?? 'actif',
                'id_createur' => $userId,
                'is_template' => $request->boolean('is_template', false),
            ]);

            if ($request->has('taches')) {
                foreach ($request->taches as $tacheData) {
                    $tache = new Tache();
                    $tache->nom_tache = $tacheData['nom_tache'];
                    $tache->description = $tacheData['description'] ?? null;
                    $tache->heure_debut_globale = $tacheData['heure_debut_globale'] ?? $tacheData['heure_debut_global'];
                    $tache->heure_fin_globale = $tacheData['heure_fin_globale'] ?? $tacheData['heure_fin_global'];

                    $formulaire->taches()->save($tache);

                    if (isset($tacheData['creneaux'])) {
                        foreach ($tacheData['creneaux'] as $creneauData) {
                            $creneau = new Creneau([
                                'heure_debut' => $creneauData['heure_debut'],
                                'heure_fin' => $creneauData['heure_fin'],
                                'quota' => $creneauData['quota'],
                            ]);
                            $tache->creneaux()->save($creneau);
                        }
                    }
                }
            }

            return response()->json($formulaire->load('taches.creneaux'), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nom_formulaire' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:255',
            'statut' => 'sometimes|required|in:actif,archive',
            'is_template' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($request, $validated, $id) {
            $formulaire = Formulaire::find($id);
            if (!$formulaire) {
                return response()->json(['message' => 'Non trouve'], 404);
            }

            $dataToUpdate = $validated;
            if ($request->has('is_template')) {
                $dataToUpdate['is_template'] = $request->boolean('is_template');
            }

            $formulaire->update($dataToUpdate);

            if ($request->has('taches')) {
                $formulaire->taches()->delete();

                foreach ($request->taches as $tacheData) {
                    $tache = new Tache();
                    $tache->nom_tache = $tacheData['nom_tache'];
                    $tache->description = $tacheData['description'] ?? null;
                    $tache->heure_debut_globale = $tacheData['heure_debut_globale'] ?? $tacheData['heure_debut_global'];
                    $tache->heure_fin_globale = $tacheData['heure_fin_globale'] ?? $tacheData['heure_fin_global'];

                    $formulaire->taches()->save($tache);

                    if (isset($tacheData['creneaux'])) {
                        foreach ($tacheData['creneaux'] as $creneauData) {
                            $creneau = new Creneau([
                                'heure_debut' => $creneauData['heure_debut'],
                                'heure_fin' => $creneauData['heure_fin'],
                                'quota' => $creneauData['quota'],
                            ]);
                            $tache->creneaux()->save($creneau);
                        }
                    }
                }
            }

            return response()->json($formulaire->load('taches.creneaux'));
        });
    }

    public function destroy($id)
    {
        $formulaire = Formulaire::find($id);
        if ($formulaire) {
            $formulaire->delete();
            return response()->json(['message' => 'Supprime avec succes']);
        }

        return response()->json(['message' => 'Non trouve'], 404);
    }
}
