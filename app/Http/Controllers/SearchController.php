<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    // Global search across regulations + admins (spec Part 25). Results
    // are grouped and paginated per-group — never loads the whole table
    // into the browser (Part 25/39).
    public function index(Request $request): Response
    {
        $term = $request->string('q')->trim()->value();

        $regulations = collect();
        $admins = collect();
        $regulationCount = 0;
        $adminCount = 0;

        if ($term !== '') {
            $regulationQuery = Regulation::query()
                ->with('category')
                ->where('status', Regulation::STATUS_PUBLISHED)
                ->where(function ($q) use ($term) {
                    $q->where('title', 'like', "%{$term}%")
                        ->orWhere('document_number', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%")
                        ->orWhereHas('tags', fn ($tq) => $tq->where('name', 'like', "%{$term}%"));
                });

            $regulationCount = (clone $regulationQuery)->count();
            $regulations = $regulationQuery->limit(10)->get()->map(fn (Regulation $r) => [
                'id' => $r->id,
                'title' => $r->title,
                'year' => $r->year,
                'document_number' => $r->document_number,
                'category' => $r->category->name,
            ]);

            $adminQuery = User::query()
                ->where('role', User::ROLE_ADMIN)
                ->where('is_active', true)
                ->with('adminProfile')
                ->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhereHas('adminProfile', function ($aq) use ($term) {
                            $aq->where('position', 'like', "%{$term}%")
                                ->orWhere('organization', 'like', "%{$term}%")
                                ->orWhere('expertise', 'like', "%{$term}%");
                        });
                });

            $adminCount = (clone $adminQuery)->count();
            // Same privacy shape as the admin directory — never expose
            // email/phone in search results.
            $admins = $adminQuery->limit(10)->get()->map(fn (User $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'position' => $a->adminProfile?->position,
                'organization' => $a->adminProfile?->organization,
                'expertise' => $a->adminProfile?->expertise ?? [],
            ]);
        }

        return Inertia::render('Search/Index', [
            'term' => $term,
            'regulations' => $regulations,
            'admins' => $admins,
            'counts' => ['regulations' => $regulationCount, 'admins' => $adminCount],
        ]);
    }
}
