<?php

/**
 * Fichier : backend/app/Http/Controllers/Api/EvenementController.php
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce controleur gere les operations API liees aux evenement.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Models\Formulaire;
use App\Services\Image\ImageConverterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Services\Formulaire\FormulaireDuplicationService;

class EvenementController extends Controller
{
    protected $imageConverter;
    protected $duplicationService;

    public function __construct(
        ImageConverterService $imageConverter,
        FormulaireDuplicationService $duplicationService
    ) {
        $this->imageConverter = $imageConverter;
        $this->duplicationService = $duplicationService;
    }

    public function index(Request $request)
    {
        try {
            $query = Evenement::select('evenements.*')
                ->orderBy('date_evenement', 'desc')
                ->with('auteur')
                ->addSelect([
                    'inscriptions_count' => \Illuminate\Support\Facades\DB::table('inscriptions')
                        ->selectRaw('count(*)')
                        ->join('creneaux', 'creneaux.id_creneau', '=', 'inscriptions.id_creneau')
                        ->join('taches', 'taches.id_tache', '=', 'creneaux.id_tache')
                        ->whereColumn('taches.id_formulaire', 'evenements.id_formulaire')
                ]);

            if ($request->has('statut') && $request->statut !== 'tous') {
                $query->where('statut', $request->statut);
            }

            if ($request->has('limit')) {
                return response()->json($query->paginate((int) $request->limit));
            }

            return response()->json($query->get());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $evenement = Evenement::with([
                'auteur',
                'formulaire.taches.creneaux.inscriptions'
            ])->find($id);

            if (!$evenement) {
                return response()->json(['message' => 'Événement non trouvé'], 404);
            }
            return response()->json($evenement);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getDetails($id)
    {
        try {
            $evenement = Evenement::with([
                'formulaire.taches.creneaux.inscriptions.utilisateur'
            ])->find($id);

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
        return \Illuminate\Support\Facades\DB::transaction(function () use ($request) {
            $validatedData = $this->validateEvenement($request);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->processAndStoreImage($request->file('image'), $validatedData['titre']);
            }

            $formulaire = Formulaire::create([
                'nom_formulaire' => 'Formulaire - ' . $validatedData['titre'],
                'description' => 'Formulaire spécifique pour l\'événement ' . $validatedData['titre'],
                'statut' => 'actif',
                'is_template' => false,
                'id_createur' => Auth::id() ?? 1
            ]);

            if ($request->has('taches')) {
                $tachesData = is_string($request->taches) ? json_decode($request->taches, true) : $request->taches;

                if (is_array($tachesData)) {
                    foreach ($tachesData as $tacheData) {
                        $tache = $formulaire->taches()->create([
                            'nom_tache' => $tacheData['nom_tache'],
                            'description' => $tacheData['description'] ?? null,
                            'heure_debut_globale' => $tacheData['heure_debut_globale'],
                            'heure_fin_globale' => $tacheData['heure_fin_globale'],
                        ]);

                        if (isset($tacheData['creneaux']) && is_array($tacheData['creneaux'])) {
                            foreach ($tacheData['creneaux'] as $creneauData) {
                                $tache->creneaux()->create([
                                    'heure_debut' => $creneauData['heure_debut'],
                                    'heure_fin' => $creneauData['heure_fin'],
                                    'quota' => $creneauData['quota']
                                ]);
                            }
                        }
                    }
                }
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
                'id_formulaire' => $formulaire->id_formulaire,
                'id_auteur' => Auth::id() ?? 1
            ]);

            return response()->json($evenement, 201);
        });
    }

    public function update(Request $request, $id)
    {
        try {
            $evenement = Evenement::find($id);
            if (!$evenement) {
                return response()->json(['message' => 'Non trouvé'], 404);
            }
            $validatedData = $this->validateEvenement($request);

            if ($request->hasFile('image')) {
                $this->deleteOldImage($evenement->image_url);                
                $evenement->image_url = $this->processAndStoreImage($request->file('image'), $validatedData['titre']);
            }

            $evenement->update([
                'titre' => $validatedData['titre'],
                'description' => $validatedData['description'],
                'date_evenement' => $validatedData['date_evenement'],
                'heure_debut' => $validatedData['heure_debut'],
                'heure_fin' => $validatedData['heure_fin'],
                'lieu' => $validatedData['lieu'],
                'statut' => $validatedData['statut'],
                'id_formulaire' => $this->parseFormulaireId($request->id_formulaire),
                'image_url' => $evenement->image_url 
            ]);

            return response()->json($evenement);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $evenement = Evenement::find($id);
            if (!$evenement) {
                return response()->json(['message' => 'Non trouvé'], 404);
            }

            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'Non autorisé. Vous devez être connecté.'], 401);
            }

            $password = $request->input('admin_password');

            if (!$password || !\Illuminate\Support\Facades\Hash::check($password, $user->mot_de_passe)) {
                return response()->json(['message' => 'Mot de passe administrateur incorrect.'], 403);
            }

            if ($evenement->id_formulaire) {
                $formulaire = Formulaire::find($evenement->id_formulaire);
                if ($formulaire && !$formulaire->is_template) {
                    $formulaire->delete();
                }
            }

            $this->deleteOldImage($evenement->image_url);
            $evenement->delete();

            return response()->json(['message' => 'Supprimé avec succès']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Centralise la validation
     */
    private function validateEvenement(Request $request)
    {
        return $request->validate([
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
    }

    /**
     * Traite l'image, la convertit en WebP et la stocke
     */
    private function processAndStoreImage($file, string $titre): string
    {
        $slug = Str::slug($titre, '_');
        $fileName = $slug . '_' . Str::random(5) . '.webp';

        $destinationPath = storage_path('app/public/evenements/' . $fileName);

        if (!Storage::disk('public')->exists('evenements')) {
            Storage::disk('public')->makeDirectory('evenements');
        }

        $this->imageConverter->convertImageToWebp($file->getRealPath(), $destinationPath, 80);

        return '/storage/evenements/' . $fileName;
    }

    /**
     * Gère le cas particulier du null envoyé en string par certains formulaires
     */
    private function parseFormulaireId($id)
    {
        return ($id === 'null' || $id === '') ? null : $id;
    }

    /**
     * Supprime physiquement l'ancien fichier
     */
    private function deleteOldImage(?string $url): void
    {
        if ($url) {
            $path = str_replace('/storage/', '', $url);
            Storage::disk('public')->delete($path);
        }
    }
}
