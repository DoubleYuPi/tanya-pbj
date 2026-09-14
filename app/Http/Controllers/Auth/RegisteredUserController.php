<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'satuanKerjaOptions' => config('satuan_kerja.list'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'satuan_kerja' => ['required', 'string', Rule::in(config('satuan_kerja.list'))],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Public registration only ever creates USER accounts (Part 6) —
        // Admin/Super Admin accounts are provisioned by an existing Super
        // Admin, never through this endpoint.
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'satuan_kerja' => $validated['satuan_kerja'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_USER,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
