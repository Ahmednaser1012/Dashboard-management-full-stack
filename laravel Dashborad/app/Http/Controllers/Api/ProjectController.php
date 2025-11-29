<?php

namespace App\Http\Controllers\Api;

use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class ProjectController extends Controller
{
    /**
     * Get a paginated list of projects with filtering and sorting
     *
     * Query Parameters:
     * - search: string - Search by project name
     * - status: string - Filter by status (pending, in_progress, completed, on_hold)
     * - priority: string - Filter by priority (low, medium, high)
     * - start_date_from: date - Filter by start date (from)
     * - start_date_to: date - Filter by start date (to)
     * - end_date_from: date - Filter by end date (from)
     * - end_date_to: date - Filter by end date (to)
     * - sort_by: string - Field to sort by (name, status, start_date, end_date, progress, budget, created_at)
     * - sort_order: string - Sort order (asc, desc)
     * - per_page: int - Items per page (default: 15)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Project::with(['creator', 'projectManager']);

        // Apply search filter
        if ($search = $request->query('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status = $request->query('status')) {
            $query->whereIn('status', explode(',', $status));
        }

        // Apply priority filter
        if ($priority = $request->query('priority')) {
            $query->whereIn('priority', explode(',', $priority));
        }

        // Apply date range filters
        if ($startDateFrom = $request->query('start_date_from')) {
            $query->whereDate('start_date', '>=', $startDateFrom);
        }
        
        if ($startDateTo = $request->query('start_date_to')) {
            $query->whereDate('start_date', '<=', $startDateTo);
        }
        
        if ($endDateFrom = $request->query('end_date_from')) {
            $query->whereDate('end_date', '>=', $endDateFrom);
        }
        
        if ($endDateTo = $request->query('end_date_to')) {
            $query->whereDate('end_date', '<=', $endDateTo);
        }

        // Apply sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortOrder = $request->query('sort_order', 'desc');
        
        // Validate sort fields
        $validSortFields = ['name', 'status', 'start_date', 'end_date', 'progress', 'budget', 'created_at'];
        $sortBy = in_array($sortBy, $validSortFields) ? $sortBy : 'created_at';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? $sortOrder : 'desc';
        
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->query('per_page', 15), 100); // Max 100 items per page
        $projects = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $projects->items(),
            'pagination' => [
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ],
            'filters' => [
                'search' => $search ?? null,
                'status' => $status ? explode(',', $status) : null,
                'priority' => $priority ? explode(',', $priority) : null,
                'start_date' => [
                    'from' => $startDateFrom,
                    'to' => $startDateTo,
                ],
                'end_date' => [
                    'from' => $endDateFrom,
                    'to' => $endDateTo,
                ],
                'sort' => [
                    'by' => $sortBy,
                    'order' => $sortOrder,
                ],
            ],
        ]);
    }

    /**
     * Create a new project
     * 
     * Required Role: Admin, ProjectManager
     */
    public function store(Request $request): JsonResponse
    {
        // Check user role
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'project_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح. فقط مدراء النظام ومدراء المشاريع يمكنهم إنشاء مشاريع جديدة.'
            ], 403);
        }

        // If current user is project manager, automatically assign them
        if ($user->role === 'project_manager') {
            $request->merge(['project_manager_id' => $user->id]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed,on_hold',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'budget' => 'required|numeric|min:0',
            'client_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'project_manager_id' => 'required|exists:users,id',
            'progress' => 'nullable|integer|min:0|max:100',
            'actual_end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            DB::beginTransaction();

            $project = Project::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'],
                'priority' => $validated['priority'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'budget' => $validated['budget'],
                'client_name' => $validated['client_name'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'project_manager_id' => $validated['project_manager_id'],
                'created_by' => $user->id,
                'progress' => $validated['progress'] ?? 0,
                'actual_end_date' => $validated['actual_end_date'] ?? null,
            ]);

            // Add project manager to team members if not already added
            if ($project->project_manager_id && !$project->teamMembers->contains($project->project_manager_id)) {
                $project->teamMembers()->attach($project->project_manager_id);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المشروع بنجاح',
                'data' => $project->load(['creator', 'projectManager'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating project: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء المشروع',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get a single project with related data
     */
    public function show(Project $project): JsonResponse
    {
        // Eager load relationships
        $project->load([
            'creator:id,name,email',
            'projectManager:id,name,email',
            'tasks' => function($query) {
                $query->select([
                    'id', 'project_id', 'title', 'description', 
                    'status', 'priority', 'due_date', 'completed_at',
                    'assigned_to', 'created_by'
                ]);
            },
            'tasks.assignedUser:id,name,email',
            'tasks.creator:id,name,email'
        ]);

        // Calculate project statistics
        $taskStats = [
            'total' => $project->tasks->count(),
            'completed' => $project->tasks->where('status', 'completed')->count(),
            'in_progress' => $project->tasks->where('status', 'in_progress')->count(),
            'pending' => $project->tasks->where('status', 'pending')->count(),
        ];

        // Calculate project progress if not manually set
        if ($project->progress === 0 && $taskStats['total'] > 0) {
            $project->progress = (int) round(($taskStats['completed'] / $taskStats['total']) * 100);
            $project->save();
        }

        return response()->json([
            'success' => true,
            'data' => array_merge($project->toArray(), [
                'task_stats' => $taskStats,
                'days_remaining' => Carbon::parse($project->end_date)->diffInDays(now()),
            ])
        ]);
    }

    /**
     * Update a project (full update)
     * 
     * Required Role: Admin, ProjectManager (for their projects)
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();
        
        // Check if user is authorized to update the project
        if ($user->role !== 'admin' && ($user->role !== 'project_manager' || $project->created_by !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this project.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,in_progress,completed,on_hold',
            'priority' => 'sometimes|required|in:low,medium,high',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'actual_end_date' => 'nullable|date|after_or_equal:start_date',
            'progress' => 'sometimes|required|integer|min:0|max:100',
            'budget' => 'sometimes|required|numeric|min:0',
            'client_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // If project is being marked as completed, set actual_end_date if not provided
            if (isset($validated['status']) && $validated['status'] === 'completed' && empty($validated['actual_end_date'])) {
                $validated['actual_end_date'] = now();
                $validated['progress'] = 100; // Ensure progress is 100% when completed
            }

            $project->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Project updated successfully',
                'data' => $project->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating project: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update project',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Partially update a project (for inline editing)
     * 
     * PATCH /api/projects/{project}
     * 
     * Required Role: Admin, ProjectManager (for their projects)
     */
    public function partialUpdate(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();
        
        // Check if user is authorized to update the project
        if ($user->role !== 'admin' && ($user->role !== 'project_manager' || $project->created_by !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this project.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'status' => 'sometimes|required|in:pending,in_progress,completed,on_hold',
            'priority' => 'sometimes|required|in:low,medium,high',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'actual_end_date' => 'sometimes|nullable|date',
            'progress' => 'sometimes|required|integer|min:0|max:100',
            'budget' => 'sometimes|required|numeric|min:0',
            'client_name' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|nullable|string',
        ]);

        // Additional validation for date consistency
        if (isset($validated['end_date']) && isset($validated['start_date'])) {
            $request->validate([
                'end_date' => 'after:start_date',
            ]);
        }

        try {
            DB::beginTransaction();

            // If project is being marked as completed, set actual_end_date if not provided
            if (isset($validated['status']) && $validated['status'] === 'completed' && empty($validated['actual_end_date'])) {
                $validated['actual_end_date'] = now();
                $validated['progress'] = 100; // Ensure progress is 100% when completed
            }

            $project->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Project updated successfully',
                'data' => $project->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating project: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update project',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Delete a project
     * 
     * Required Role: Admin, ProjectManager (for their projects)
     */
    /**
     * Get projects for the current authenticated user
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function myProjects(Request $request): JsonResponse
    {
        $user = $request->user();
        \Log::info('Fetching projects for user: ' . $user->id . ' - ' . $user->name);
        
        // Build the query to get all projects where:
        // 1. User is the creator (created_by)
        // 2. OR User is the project manager (project_manager_id)
        // 3. OR User is a team member (through project_team table)
        $query = Project::where(function($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhere('project_manager_id', $user->id)
              ->orWhereHas('teamMembers', function($q) use ($user) {
                  $q->where('user_id', $user->id);
              });
        });
        
        // Apply sorting
        $sortBy = $request->query('sortBy', 'created_at');
        // Convert camelCase to snake_case for database columns
        $sortBy = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $sortBy));
        $sortOrder = $request->query('sortOrder', 'desc');
        $perPage = $request->query('pageSize', 10);
        
        // Log the final query for debugging
        \Log::info('Projects query: ' . $query->toSql());
        \Log::info('Query bindings: ', $query->getBindings());
        
        $projects = $query->orderBy($sortBy, $sortOrder)
            ->with(['projectManager', 'teamMembers']) // Eager load relationships
            ->paginate($perPage);
            
        return response()->json([
            'success' => true,
            'data' => $projects,
            'user_role' => $user->role, // For debugging frontend
            'user_id' => $user->id      // For debugging frontend
        ]);
    }
    
    public function destroy(Project $project): JsonResponse
    {
        $user = request()->user();
        
        // Check if user is authorized to delete the project
        if ($user->role !== 'admin' && ($user->role !== 'project_manager' || $project->created_by !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this project.'
            ], 403);
        }
        
        try {
            DB::beginTransaction();
            
            // Delete related tasks first (if needed)
            $project->tasks()->delete();
            
            // Delete the project
            $project->delete();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Project deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting project: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete project',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
