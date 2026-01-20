<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EvenementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Evenement::orderBy('date_evenement', 'desc');
            $evenements = $query->get();

            return response()->json($evenements);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $evenement = Evenement::find($id);

            if (!$evenement) {
                return response()->json(['message' => 'Événement non trouvé'], 404);
            }
            return response()->json($evenement);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'date_evenement' => 'required|date',
                'heure_debut' => 'required',
                'heure_fin' => 'required',
                'lieu' => 'required|string|max:255',
                'statut' => 'required|in:brouillon,publie,termine,annule',
                'image' => 'nullable|image|max:2048',
                'id_formulaire' => 'nullable'
            ]);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('evenements', 'public');
                $imagePath = '/storage/' . $path;
            }
            $idFormulaire = $request->id_formulaire;
            if ($idFormulaire === 'null' || $idFormulaire === '') {
                $idFormulaire = null;
            }
            $evenement = Evenement::create([
                'titre' => $validatedData['titre'],
                'description' => $validatedData['description'],
                'date_evenement' => $validatedData['date_evenement'],
                'heure_debut' => $validatedData['heure_debut'],
                'heure_fin' => $validatedData['heure_fin'],
                'lieu' => $validatedData['lieu'],
                'statut' => $validatedData['statut'],
                'image_url' => $imagePath,
                'id_formulaire' => $idFormulaire,
                'id_auteur' => 1 // ID par défaut pour la V1 (à remplacer par auth()->id())
            ]);

            return response()->json($evenement, 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $evenement = Evenement::find($id);
            if (!$evenement) {
                return response()->json(['message' => 'Non trouvé'], 404);
            }

            $validatedData = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string',
                'date_evenement' => 'required|date',
                'heure_debut' => 'required',
                'heure_fin' => 'required',
                'lieu' => 'required|string|max:255',
                'statut' => 'required|in:brouillon,publie,termine,annule',
                'image' => 'nullable|image|max:2048',
                'id_formulaire' => 'nullable'
            ]);

            if ($request->hasFile('image')) {
                if ($evenement->image_url) {
                    $oldPath = str_replace('/storage/', '', $evenement->image_url);
                    Storage::disk('public')->delete($oldPath);
                }

                $path = $request->file('image')->store('evenements', 'public');
                $evenement->image_url = '/storage/' . $path;
            }
            $idFormulaire = $request->id_formulaire;
            if ($idFormulaire === 'null' || $idFormulaire === '') {
                $idFormulaire = null;
            }
            $evenement->update([
                'titre' => $validatedData['titre'],
                'description' => $validatedData['description'],
                'date_evenement' => $validatedData['date_evenement'],
                'heure_debut' => $validatedData['heure_debut'],
                'heure_fin' => $validatedData['heure_fin'],
                'lieu' => $validatedData['lieu'],
                'statut' => $validatedData['statut'],
                'id_formulaire' => $idFormulaire,
            ]);

            if ($request->hasFile('image')) {
                $evenement->save();
            }

            return response()->json($evenement);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        // logique des perms de modifs/suppr
        $role = $user ? strtolower($user->role) : '';
        $isAuteur = ($evenement->id_auteur === $user->id_utilisateur);

        if ($role !== 'administrateur' && ($role !== 'membre_bureau' || !$isAuteur)) {
            return response()->json(['message' => 'Accès refusé. Vous ne pouvez modifier que vos propres événements.'], 403);
        }
        $data = $request->all();

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = uniqid('event_') . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('evenements', $filename, 'public');
            $data['image_url'] = '/storage/' . $path;
        }
        unset($data['id_auteur']);

        $evenement->update($data);
        return response()->json($evenement);
    }

    public function destroy($id)
    {
        $evenement = Evenement::find($id);
        if ($evenement) {
            if ($evenement->image_url) {
                $oldPath = str_replace('/storage/', '', $evenement->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            
            $evenement->delete();
            return response()->json(['message' => 'Supprimé avec succès']);
        }
        return response()->json(['message' => 'Non trouvé'], 404);
    }
}



