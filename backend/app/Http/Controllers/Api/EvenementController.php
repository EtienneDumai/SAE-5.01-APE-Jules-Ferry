<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class EvenementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Evenement::orderBy('date_evenement', 'desc');
            if ($request->has('statut') && $request->statut !== 'tous') {
                $query->where('statut', $request->statut);
            }
            $evenements = $query->with('auteur')->get();

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
                'image' => 'nullable|image|max:20048',
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

            $idAuteur = Auth::id() ?? 1; //fallback sur 1 si auth non dispo

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
                'id_auteur' => $idAuteur 
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
                'image' => 'nullable|image|max:20048',
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