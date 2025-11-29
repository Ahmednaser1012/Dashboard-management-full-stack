<?php

namespace App\Http\Controllers\Api;

use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Project $project, Request $request): JsonResponse
    {
        $query = $project->tasks()->with(['assignee', 'users']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->get();

        return response()->json($tasks);
    }

    public function store(Project $project, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,doing,done',
            'priority' => 'required|in:low,medium,high',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date',
            'estimated_hours' => 'nullable|numeric|min:0|max:1000',
            'user_ids' => 'sometimes|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'],
            'due_date' => $validated['due_date'],
            'estimated_hours' => $validated['estimated_hours'] ?? null,
            'created_by' => Auth::id() // Add the authenticated user's ID using Auth facade
        ]);

        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }

        return response()->json($task->load('assignee', 'users'), 201);
    }

    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load('project', 'assignee', 'users'));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,doing,done',
            'priority' => 'sometimes|in:low,medium,high',
            'assigned_to' => 'sometimes|exists:users,id',
            'due_date' => 'sometimes|date',
            'estimated_hours' => 'nullable|numeric|min:0|max:1000',
            'user_ids' => 'sometimes|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $task->update($validated);

        if (isset($validated['user_ids'])) {
            $task->users()->sync($validated['user_ids']);
        }

        return response()->json($task->load('assignee', 'users'));
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'exists:tasks,id',
            'status' => 'sometimes|in:todo,doing,done',
            'priority' => 'sometimes|in:low,medium,high',
            'assigned_to' => 'sometimes|exists:users,id'
        ]);

        $updates = array_filter($request->only(['status', 'priority', 'assigned_to']));
        
        if (!empty($updates)) {
            Task::whereIn('id', $validated['task_ids'])->update($updates);
        }

        return response()->json(['message' => 'Tasks updated successfully']);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();
        return response()->json(null, 204);
    }
}
