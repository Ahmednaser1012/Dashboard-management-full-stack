<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of the users with optional role filter.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = User::query();
            
            // Filter by role if provided
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            // Pagination
            $perPage = $request->input('per_page', 10);
            $users = $query->paginate($perPage);
            
            return response()->json([
                'data' => $users->items(),
                'total' => $users->total(),
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'last_page' => $users->lastPage(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get Users Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء جلب بيانات المستخدمين',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by role
     *
     * @param  string  $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByRole($role)
    {
        try {
            $users = User::where('role', $role)
                ->select('id', 'name', 'email', 'role', 'created_at')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $users
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get Users By Role Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب بيانات المستخدمين',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all project managers
     * Get project managers
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProjectManagers()
    {
        try {
            $managers = User::where('role', 'project_manager')->get();
            
            return response()->json([
                'data' => $managers
            ]);
            
        } catch (\Exception $e) {
            Log::error('Get Project Managers Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء جلب مدراء المشاريع',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
