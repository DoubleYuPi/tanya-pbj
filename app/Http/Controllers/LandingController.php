<?php

namespace App\Http\Controllers;

use App\Models\HeroSlide;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Landing', [
            'slides' => HeroSlide::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'title', 'subtitle', 'image_path', 'link_url'])
                ->makeHidden('image_path'),
        ]);
    }
}
