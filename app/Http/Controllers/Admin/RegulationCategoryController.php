<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegulationCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegulationCategoryController extends Controller
{
    // Simple CRUD (spec Part 24) — Super Admin only, enforced by the
    // 'role:super_admin' route middleware group this controller sits in.
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => RegulationCategory::withCount('regulations')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('regulation_categories', 'name')],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        RegulationCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, RegulationCategory $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('regulation_categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(RegulationCategory $category)
    {
        if ($category->regulations()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki peraturan.');
        }

        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
