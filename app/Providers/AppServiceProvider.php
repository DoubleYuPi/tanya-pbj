<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Regulation;
use App\Policies\ConversationPolicy;
use App\Policies\RegulationPolicy;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Carried over from the old RouteServiceProvider (Laravel 11+ folds
        // this into a provider instead of a dedicated class).
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Keyed by email+IP together (not IP alone) so throttling can't be
        // trivially bypassed by rotating IPs while still guessing one
        // account's password, and one attacker can't lock out a victim's
        // account by hammering it from many IPs (spec Part 38).
        RateLimiter::for('login', function (Request $request) {
            $key = Str::transliterate(Str::lower($request->input('email', '')).'|'.$request->ip());

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            $key = Str::transliterate(Str::lower($request->input('email', '')).'|'.$request->ip());

            return Limit::perMinute(5)->by($key);
        });

        // Carried over from the old EventServiceProvider's $listen array.
        Event::listen(Registered::class, SendEmailVerificationNotification::class);

        Gate::policy(Regulation::class, RegulationPolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);

        if (app()->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}
