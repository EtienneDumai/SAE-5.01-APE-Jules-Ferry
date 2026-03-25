<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulaire;
use App\Models\Tache;
use App\Models\Creneau;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FormulaireController extends Controller
{
    public function index(Request $request)
    {
        $query = Formulaire::with('taches.creneaux');
        
        if ($request->has('is_template')) {
            $query->where('is_template', $request->boolean('is_template'));
        }

        $formulaires = $query->get();
        return response()->json($formulaires);
    }
    
    public function show($id)
    {
        try {
            $formulaire = Formulaire::with([
                'taches.creneaux' => function($query) {
                    $query->withCount('inscriptions')->with('inscriptions');
                }
            ])->find($id);

            if (!$formulaire) return response()->json(['message' => 'Non trouvé'], 404);
            return response()->json($formulaire);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $userId = Auth::id() ?? 1;
        return DB::transaction(function () use ($request, $userId) {
            
            $formulaire = Formulaire::create([
                'nom_formulaire' => $request->nom_formulaire,
                'description' => $request->description,
                'statut' => $request->statut ?? 'actif',
                'id_createur' => $userId,
                'is_template' => $request->boolean('is_template', false)
            ]);

            if ($request->has('taches')) {
                foreach ($request->taches as $tacheData) {
                    
                    // mapping des champs manuel
                    $tache = new Tache();
                    $tache->nom_tache = $tacheData['nom_tache'];
                    $tache->description = $tacheData['description'] ?? null;
                    $tache->heure_debut_globale = $tacheData['heure_debut_globale'] ?? $tacheData['heure_debut_global'];
                    $tache->heure_fin_globale   = $tacheData['heure_fin_globale']   ?? $tacheData['heure_fin_global'];
                    
                    $formulaire->taches()->save($tache);

                    if (isset($tacheData['creneaux'])) {
                        foreach ($tacheData['creneaux'] as $creneauData) {
                            $creneau = new Creneau([
                                'heure_debut' => $creneauData['heure_debut'],
                                'heure_fin' => $creneauData['heure_fin'],
                                'quota' => $creneauData['quota']
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
        return DB::transaction(function () use ($request, $id) {
            $formulaire = Formulaire::find($id);
            if (!$formulaire) return response()->json(['message' => 'Non trouvé'], 404);

            $formulaire->update($request->only(['nom_formulaire', 'description', 'statut', 'is_template']));

            // Reset des taches
            if ($request->has('taches')) {
                $formulaire->taches()->delete();

                foreach ($request->taches as $tacheData) {
                    $tache = new Tache();
                    $tache->nom_tache = $tacheData['nom_tache'];
                    $tache->description = $tacheData['description'] ?? null;
                    $tache->heure_debut_globale = $tacheData['heure_debut_globale'] ?? $tacheData['heure_debut_global'];
                    $tache->heure_fin_globale   = $tacheData['heure_fin_globale']   ?? $tacheData['heure_fin_global'];

                    $formulaire->taches()->save($tache);

                    if (isset($tacheData['creneaux'])) {
                        foreach ($tacheData['creneaux'] as $creneauData) {
                            $creneau = new Creneau([
                                'heure_debut' => $creneauData['heure_debut'],
                                'heure_fin' => $creneauData['heure_fin'],
                                'quota' => $creneauData['quota']
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
            return response()->json(['message' => 'Supprimé avec succès']);
        }
        return response()->json(['message' => 'Non trouvé'], 404);
    }
}