<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evenement;
use Illuminate\Http\Request;

class EvenementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $evenements = Evenement::where('statut', 'publie')
                                   ->orderBy('date_evenement', 'desc')
                                   ->get();

            return response()->json($evenements);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        try {
            $evenement = Evenement::find($id);

            if (!$evenement) {
                return response()->json(['message' => 'Événement non trouvé'], 404);
            }

            if ($evenement->statut !== 'publie') {
                return response()->json(['message' => 'Événement non accessible'], 403);
            }

            return response()->json($evenement);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    //a faire avec auth et permissions
    public function store(Request $request)
    {
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy($id)
    {
    }
}