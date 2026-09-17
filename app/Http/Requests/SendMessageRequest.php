<?php

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('sendMessage', $this->route('conversation'));
    }

    public function rules(): array
    {
        $maxKb = (int) Setting::get('attachment_max_upload_mb', env('ATTACHMENT_MAX_UPLOAD_MB', 10)) * 1024;

        return [
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['sometimes', 'array', 'max:3'],
            // Never trust the client-reported mime type — mimes: checks
            // the actual file content (spec Part 28: MIME validation,
            // prevent executable uploads).
            'attachments.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:'.$maxKb],
        ];
    }
}
