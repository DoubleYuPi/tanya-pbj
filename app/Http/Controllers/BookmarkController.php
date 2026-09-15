<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $regulations = $request->user()
            ->bookmarkedRegulations()
            ->with('category')
            ->orderByDesc('user_bookmarks.created_at')
            ->paginate(12);

        return Inertia::render('Regulations/Bookmarks', [
            'regulations' => $regulations,
        ]);
    }

    public function store(Request $request, Regulation $regulation)
    {
        $this->authorize('view', $regulation);

        $request->user()->bookmarkedRegulations()->syncWithoutDetaching([$regulation->id]);

        return back()->with('success', 'Peraturan ditambahkan ke daftar tersimpan.');
    }

    public function destroy(Request $request, Regulation $regulation)
    {
        $request->user()->bookmarkedRegulations()->detach($regulation->id);

        return back()->with('success', 'Peraturan dihapus dari daftar tersimpan.');
    }
}
