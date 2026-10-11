<?php

namespace App\Http\Controllers;

use App\Models\UkpbjSection;
use Inertia\Inertia;
use Inertia\Response;

class UkpbjProfileController extends Controller
{
    // Public page — no login needed.
    public function index(): Response
    {
        return Inertia::render('Ukpbj/Profile', [
            'sections' => UkpbjSection::with('images')->orderBy('id')->get(),
        ]);
    }
}
