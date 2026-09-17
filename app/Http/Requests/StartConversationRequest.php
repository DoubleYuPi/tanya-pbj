<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_id' => [
                'required',
                Rule::exists('users', 'id')->where('role', User::ROLE_ADMIN)->where('is_active', true),
            ],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }
}
