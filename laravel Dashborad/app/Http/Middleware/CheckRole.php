<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle($request, Closure $next, ...$roles)
    {
        if (! $request->user()) {
            return response()->json(['message' => 'يجب تسجيل الدخول أولاً'], 401);
        }

        if (! in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'غير مصرح لك بالوصول'], 403);
        }

        return $next($request);
    }
}
