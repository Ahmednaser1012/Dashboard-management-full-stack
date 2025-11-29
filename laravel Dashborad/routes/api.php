<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;

// Test route to verify API routes are being loaded
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
    
    // Projects routes with role-based access
    // Get projects for the current user - must come before the resource route
    Route::get('projects/my-projects', [ProjectController::class, 'myProjects'])->name('projects.my-projects');
    
    // Projects resource route
    Route::apiResource('projects', ProjectController::class)->except(['update']);
    
    // Add PATCH route for partial updates (inline editing)
    Route::patch('projects/{project}', [ProjectController::class, 'partialUpdate'])
        ->name('projects.partial-update');
    
    // Full update route with role restriction
    Route::put('projects/{project}', [ProjectController::class, 'update'])
        ->middleware([\App\Http\Middleware\CheckRole::class . ':admin,project_manager'])
        ->name('projects.update');
    
    // Project tasks routes
    Route::get('projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('projects/{project}/tasks', [TaskController::class, 'store'])
        ->middleware([\App\Http\Middleware\CheckRole::class . ':admin,project_manager']);
    
    // Tasks routes with role restrictions
    Route::apiResource('tasks', TaskController::class)
        ->except(['index', 'store', 'update']);
        
    // Add PATCH route for task updates (partial updates)
    Route::patch('tasks/{task}', [TaskController::class, 'update'])
        ->name('tasks.update');
    
    // Bulk update tasks
    Route::post('tasks/bulk-update', [TaskController::class, 'bulkUpdate'])
        ->middleware([\App\Http\Middleware\CheckRole::class . ':admin,project_manager']);
    
    // Project managers list - accessible to all authenticated users
    Route::get('/users/project-managers', [UserController::class, 'getProjectManagers']);
    
    // Admin only routes - using full middleware class path
    Route::middleware([
        'auth:sanctum', 
        \App\Http\Middleware\CheckRole::class . ':admin'
    ])->group(function () {
        // User management routes
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/role/{role}', [UserController::class, 'getByRole']);
    });
});
