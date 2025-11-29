<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Remove all web middleware from API group
        $middleware->api(remove: [
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\Session\Middleware\AuthenticateSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
        ]);

        // Configure API middleware group to be stateless
        $middleware->group('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
        // Remove VerifyCsrfToken from all middleware groups
        $middleware->removeFromGroup('web', \App\Http\Middleware\VerifyCsrfToken::class);
        $middleware->removeFromGroup('api', \App\Http\Middleware\VerifyCsrfToken::class);
        
        // Disable VerifyCsrfToken middleware completely
        $middleware->remove(\App\Http\Middleware\VerifyCsrfToken::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
