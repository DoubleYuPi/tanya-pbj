<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        // Carried over from the old EventServiceProvider's $listen array.
        Event::listen(Registered::class, SendEmailVerificationNotification::class);

        // Gate::policy(...) calls for Conversation/Regulation land here in
        // Phase 3/5 once those models and policies exist.
    }
}
