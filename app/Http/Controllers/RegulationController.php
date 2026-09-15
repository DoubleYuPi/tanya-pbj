<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use App\Models\RegulationCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RegulationController extends Controller
{
    // Public regulation library (spec Part 20/21) — browsable and
    // downloadable without login, since these are public government
    // documents; only bookmarking requires an account (Part 26).
    public function index(Request $request): Response
    {
        $query = Regulation::query()
            ->with('category')
            ->where('status', Regulation::STATUS_PUBLISHED);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->value()) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($year = $request->integer('year')) {
            $query->where('year', $year);
        }

        $regulations = $query->orderByDesc('year')->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Regulations/Index', [
            'regulations' => $regulations,
            'categories' => RegulationCategory::orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => $request->only(['search', 'category', 'year']),
        ]);
    }

    public function show(Request $request, Regulation $regulation): Response
    {
        $this->authorize('view', $regulation);

        $regulation->load(['category', 'tags', 'uploader']);

        $related = Regulation::query()
            ->where('status', Regulation::STATUS_PUBLISHED)
            ->where('regulation_category_id', $regulation->regulation_category_id)
            ->where('id', '!=', $regulation->id)
            ->limit(4)
            ->get(['id', 'title', 'year', 'document_number']);

        $isBookmarked = $request->user()
            ? $request->user()->bookmarkedRegulations()->where('regulation_id', $regulation->id)->exists()
            : false;

        return Inertia::render('Regulations/Show', [
            'regulation' => $regulation,
            'related' => $related,
            'isBookmarked' => $isBookmarked,
        ]);
    }

    public function download(Regulation $regulation)
    {
        $this->authorize('view', $regulation);

        abort_unless(Storage::disk($regulation->file_disk)->exists($regulation->file_path), 404);

        return Storage::disk($regulation->file_disk)->download(
            $regulation->file_path,
            $regulation->file_original_name
        );
    }

    // Inline preview (embedded PDF viewer on the detail page) — same
    // authorization as download, just served without the
    // Content-Disposition: attachment header.
    public function preview(Regulation $regulation)
    {
        $this->authorize('view', $regulation);

        abort_unless(Storage::disk($regulation->file_disk)->exists($regulation->file_path), 404);

        return Storage::disk($regulation->file_disk)->response($regulation->file_path, $regulation->file_original_name, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
