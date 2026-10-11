<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroSlideController extends Controller
{
    // Super Admin only, enforced by the 'role:super_admin' route group.
    public function index(): Response
    {
        return Inertia::render('Admin/HeroSlides/Index', [
            'slides' => HeroSlide::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(imageRequired: true), $this->messages());

        HeroSlide::create([
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'image_path' => $request->file('image')->store('hero-slides', 'public'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) HeroSlide::max('sort_order') + 1,
        ]);

        return back()->with('success', 'Slide berhasil ditambahkan.');
    }

    public function update(Request $request, HeroSlide $heroSlide)
    {
        $validated = $request->validate($this->rules(imageRequired: false), $this->messages());

        $data = [
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'is_active' => $request->boolean('is_active'),
            'sort_order' => $validated['sort_order'] ?? $heroSlide->sort_order,
        ];

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($heroSlide->image_path);
            $data['image_path'] = $request->file('image')->store('hero-slides', 'public');
        }

        $heroSlide->update($data);

        return back()->with('success', 'Slide berhasil diperbarui.');
    }

    public function destroy(HeroSlide $heroSlide)
    {
        Storage::disk('public')->delete($heroSlide->image_path);
        $heroSlide->delete();

        return back()->with('success', 'Slide berhasil dihapus.');
    }

    private function rules(bool $imageRequired): array
    {
        return [
            'image' => [$imageRequired ? 'required' : 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            // Only internal paths ("/peraturan") or http(s) links — blocks javascript: etc.
            'link_url' => ['nullable', 'string', 'max:2048', 'regex:/^(\/(?!\/)|https?:\/\/)/'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function messages(): array
    {
        return [
            'link_url.regex' => 'Tautan harus diawali "/" (halaman internal, mis. /peraturan) atau "https://".',
        ];
    }
}
