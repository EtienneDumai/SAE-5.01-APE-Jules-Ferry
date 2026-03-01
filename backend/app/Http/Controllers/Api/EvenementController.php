<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use App\Services\Image\ImageConverterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class EvenementController extends Controller
{
    protected $imageConverter;

    public function __construct(ImageConverterService $imageConverter)
    {
        $this->imageConverter = $imageConverter;
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
            $evenement = Evenement::find($id);

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
        try {
            $validatedData = $this->validateEvenement($request);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $this->processAndStoreImage($request->file('image'));
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
                'id_formulaire' => $this->parseFormulaireId($request->id_formulaire),
                'id_auteur' => Auth::id() ?? 1
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

            $validatedData = $this->validateEvenement($request);

            if ($request->hasFile('image')) {
                $this->deleteOldImage($evenement->image_url);
                $evenement->image_url = $this->processAndStoreImage($request->file('image'));
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

    public function destroy($id)
    {
        try {
            $evenement = Evenement::find($id);
            if (!$evenement) {
                return response()->json(['message' => 'Non trouvé'], 404);
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
    private function processAndStoreImage($file): string
    {
        $fileName = Str::random(20) . '.webp';
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