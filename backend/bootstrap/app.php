<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(DIR))
    ->withRouting(
        web: DIR . '/../routes/web.php',
        api: DIR . '/../routes/api.php',
        commands: DIR . '/../routes/console.php',
        health: '/up',
    )->withMiddleware(function (Middleware $middleware) {

        $middleware->trustProxies(
            at: '',
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
            \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        );

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/',
        ]);
    })->create();