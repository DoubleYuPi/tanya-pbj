<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UkpbjSection;
use App\Models\UkpbjSectionImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UkpbjSectionController extends Controller
{
    // Super Admin only — enforced by the 'role:super_admin' route group.
    public function index(): Response
    {
        $sections = UkpbjSection::withCount('images')
            ->orderBy('id')
            ->get()
            ->map(fn (UkpbjSection $s) => [
                'id' => $s->id,
                'key' => $s->key,
                'title' => $s->title,
                'has_content' => filled($s->content),
                'images_count' => $s->images_count,
            ]);

        return Inertia::render('Admin/Ukpbj/Index', ['sections' => $sections]);
    }

    public function edit(UkpbjSection $section): Response
    {
        return Inertia::render('Admin/Ukpbj/Edit', [
            'section' => $section->load('images'),
        ]);
    }

    public function update(Request $request, UkpbjSection $section)
    {
        $validated = $request->validate([
            'content' => ['nullable', 'string', 'max:20000'],
            'captions' => ['nullable', 'array'],
            'captions.*' => ['nullable', 'string', 'max:255'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer'],
            'new_images' => ['nullable', 'array', 'max:10'],
            'new_images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'new_captions' => ['nullable', 'array'],
            'new_captions.*' => ['nullable', 'string', 'max:255'],
        ], [
            'new_images.*.image' => 'File harus berupa gambar.',
            'new_images.*.mimes' => 'Gambar harus berformat JPG, PNG, atau WEBP.',
            'new_images.*.max' => 'Ukuran setiap gambar maksimal 4 MB.',
            'new_images.max' => 'Maksimal 10 gambar sekali unggah.',
        ]);

        $removeIds = $validated['remove_image_ids'] ?? [];

        DB::transaction(function () use ($request, $validated, $section, $removeIds) {
            $section->update(['content' => $validated['content'] ?? null]);

            // Captions of existing images (skip the ones being removed).
            foreach ($validated['captions'] ?? [] as $imageId => $caption) {
                if (in_array((int) $imageId, $removeIds, true)) {
                    continue;
                }
                $section->images()->whereKey($imageId)->update(['caption' => $caption]);
            }

            // Remove images (scoped to this section so IDs from elsewhere are ignored).
            $section->images()->whereIn('id', $removeIds)->get()->each(function (UkpbjSectionImage $image) {
                Storage::disk(UkpbjSectionImage::DISK)->delete($image->path);
                $image->delete();
            });

            // Add new images with random, unguessable filenames.
            $order = (int) $section->images()->max('sort_order');
            foreach ($request->file('new_images', []) as $i => $file) {
                $section->images()->create([
                    'path' => $file->store('ukpbj', UkpbjSectionImage::DISK),
                    'caption' => $validated['new_captions'][$i] ?? null,
                    'sort_order' => ++$order,
                ]);
            }
        });

        return to_route('admin.ukpbj.edit', $section)->with('success', "Bagian \"{$section->title}\" berhasil disimpan.");
    }
}
