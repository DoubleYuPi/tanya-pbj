<?php

namespace App\Http\Requests\Admin;

use App\Models\Regulation;
use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRegulationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Regulation::class);
    }

    public function rules(): array
    {
        $maxKb = (int) Setting::get('regulation_max_upload_mb', env('REGULATION_MAX_UPLOAD_MB', 25)) * 1024;

        return [
            'regulation_category_id' => ['required', 'exists:regulation_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'year' => ['required', 'integer', 'min:1945', 'max:'.(now()->year + 1)],
            'issuing_institution' => ['nullable', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_sample_data' => ['sometimes', 'boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            // Only PDFs, size configurable via .env — never trust the
            // client-reported mime type (spec Part 23/38).
            'file' => ['required', 'file', 'mimes:pdf', 'max:'.$maxKb],
        ];
    }
}
