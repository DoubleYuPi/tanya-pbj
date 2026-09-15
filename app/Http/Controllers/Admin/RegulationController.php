<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRegulationRequest;
use App\Http\Requests\Admin\UpdateRegulationRequest;
use App\Models\Regulation;
use App\Models\RegulationCategory;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegulationController extends Controller
{
    // Super Admin regulation CMS (spec Part 23). Every action here is
    // additionally gated by the 'role:super_admin' route middleware, and
    // each mutating action re-checks the RegulationPolicy directly too —
    // never trust the route middleware alone for something this sensitive.
    public function index(Request $request): Response
    {
        $query = Regulation::query()->with(['category', 'uploader']);

        if ($search = $request->string('search')->trim()->value()) {
            $query->where('title', 'like', "%{$search}%");
        }

        $regulations = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Regulations/Index', [
            'regulations' => $regulations,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Regulations/Create', [
            'categories' => RegulationCategory::orderBy('name')->get(['id', 'name']),
            'maxUploadMb' => (int) env('REGULATION_MAX_UPLOAD_MB', 25),
        ]);
    }

    public function store(StoreRegulationRequest $request)
    {
        $validated = $request->validated();
        $file = $request->file('file');

        // Secure, unguessable filename — never trust the client's original
        // filename for the stored path (spec Part 23/38).
        $storedName = Str::uuid().'.pdf';
        $path = $file->storeAs('', $storedName, 'regulations');

        $regulation = DB::transaction(function () use ($validated, $request, $file, $path) {
            $regulation = Regulation::create([
                ...$validated,
                'file_disk' => 'regulations',
                'file_path' => $path,
                'file_original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);

            $this->syncTags($regulation, $validated['tags'] ?? []);

            return $regulation;
        });

        return to_route('admin.regulations.index')->with('success', "Peraturan \"{$regulation->title}\" berhasil diunggah.");
    }

    public function edit(Regulation $regulation): Response
    {
        $this->authorize('update', $regulation);

        return Inertia::render('Admin/Regulations/Edit', [
            'regulation' => $regulation->load('tags'),
            'categories' => RegulationCategory::orderBy('name')->get(['id', 'name']),
            'maxUploadMb' => (int) env('REGULATION_MAX_UPLOAD_MB', 25),
        ]);
    }

    public function update(UpdateRegulationRequest $request, Regulation $regulation)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, $regulation) {
            if ($file = $request->file('file')) {
                // Replace the stored PDF — delete the old one only after
                // the new one is safely stored.
                $storedName = Str::uuid().'.pdf';
                $newPath = $file->storeAs('', $storedName, 'regulations');

                Storage::disk($regulation->file_disk)->delete($regulation->file_path);

                $regulation->file_path = $newPath;
                $regulation->file_original_name = $file->getClientOriginalName();
                $regulation->file_size = $file->getSize();
            }

            $regulation->fill(collect($validated)->except(['file', 'tags'])->toArray());
            $regulation->save();

            $this->syncTags($regulation, $validated['tags'] ?? []);
        });

        return to_route('admin.regulations.index')->with('success', "Peraturan \"{$regulation->title}\" berhasil diperbarui.");
    }

    public function destroy(Regulation $regulation)
    {
        $this->authorize('delete', $regulation);

        // Soft delete keeps the audit trail and the file on disk; a
        // permanent-delete/cleanup job is out of scope for this phase.
        $regulation->delete();

        return to_route('admin.regulations.index')->with('success', 'Peraturan berhasil dihapus.');
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

    private function syncTags(Regulation $regulation, array $tagNames): void
    {
        $tagIds = collect($tagNames)
            ->filter()
            ->map(function (string $name) {
                return Tag::firstOrCreate(
                    ['slug' => Str::slug($name)],
                    ['name' => $name]
                )->id;
            });

        $regulation->tags()->sync($tagIds);
    }
}
