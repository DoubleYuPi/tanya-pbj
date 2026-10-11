<?php

namespace App\Http\Controllers;

use App\Models\FaqCategory;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    // Public page — no login needed. Empty categories are hidden.
    public function index(): Response
    {
        $categories = FaqCategory::with('faqs')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn (FaqCategory $c) => $c->faqs->isNotEmpty())
            ->values();

        return Inertia::render('Faq/Index', ['categories' => $categories]);
    }
}
