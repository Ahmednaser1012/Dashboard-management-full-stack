<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Tymon\JWTAuth\JWTGuard;

class Controller extends BaseController
{
    /**
     * Get the authenticated user.
     *
     * @return \App\Models\User|null
     */
    public function auth()
    {
        return auth('api')->user();
    }

    /**
     * Get the JWT guard instance.
     *
     * @return JWTGuard
     */
    public function guard()
    {
        return auth('api');
    }
    /**
     * Send a success response.
     *
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     * @return JsonResponse
     */
    protected function success($data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Send an error response.
     *
     * @param string $message
     * @param int $statusCode
     * @param array $errors
     * @return JsonResponse
     */
    protected function error(string $message = 'Error', int $statusCode = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }
}
