<?php

namespace App\Http\Controllers;

use App\Models\HeroSlide;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use PDOException;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Landing', [
            'slides' => $this->activeSlides(),
        ]);
    }

    // If the database is down (or the table isn't migrated yet), return no
    // slides so the landing page falls back to the basic static hero.
    private function activeSlides(): array
    {
        try {
            return HeroSlide::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'title', 'subtitle', 'image_path', 'link_url'])
                ->makeHidden('image_path')
                ->all();
        } catch (QueryException|PDOException $e) {
            Log::warning('Landing slides unavailable, using fallback hero: '.$e->getMessage());

            return [];
        }
    }
}
