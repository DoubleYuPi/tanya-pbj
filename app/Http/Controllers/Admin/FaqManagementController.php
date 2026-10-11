<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FaqManagementController extends Controller
{
    // Categories + questions are managed on one page. Super Admin only,
    // enforced by the 'role:super_admin' route group.
    public function index(): Response
    {
        return Inertia::render('Admin/Faq/Index', [
            'categories' => FaqCategory::with('faqs')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('faq_categories', 'name')],
        ]);

        FaqCategory::create([
            'name' => $validated['name'],
            'sort_order' => (int) FaqCategory::max('sort_order') + 1,
        ]);

        return back()->with('success', 'Kategori FAQ berhasil ditambahkan.');
    }

    public function updateCategory(Request $request, FaqCategory $faqCategory)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('faq_categories', 'name')->ignore($faqCategory->id)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $faqCategory->update([
            'name' => $validated['name'],
            'sort_order' => $validated['sort_order'] ?? $faqCategory->sort_order,
        ]);

        return back()->with('success', 'Kategori FAQ berhasil diperbarui.');
    }

    public function destroyCategory(FaqCategory $faqCategory)
    {
        // Its questions are deleted too (cascade) — the UI asks for confirmation first.
        $faqCategory->delete();

        return back()->with('success', 'Kategori FAQ berhasil dihapus.');
    }

    public function storeFaq(Request $request, FaqCategory $faqCategory)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:10000'],
        ]);

        $faqCategory->faqs()->create([
            ...$validated,
            'sort_order' => (int) $faqCategory->faqs()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Pertanyaan berhasil ditambahkan.');
    }

    public function updateFaq(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:10000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $faq->update([
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'sort_order' => $validated['sort_order'] ?? $faq->sort_order,
        ]);

        return back()->with('success', 'Pertanyaan berhasil diperbarui.');
    }

    public function destroyFaq(Faq $faq)
    {
        $faq->delete();

        return back()->with('success', 'Pertanyaan berhasil dihapus.');
    }
}
