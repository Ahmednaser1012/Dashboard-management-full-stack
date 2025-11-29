<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TaskPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view tasks
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        // Admin and Project Manager can view all tasks
        // Developer can only view tasks assigned to them
        return $user->role === User::ROLE_ADMIN ||
               $user->role === User::ROLE_PROJECT_MANAGER ||
               $task->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only Admin and Project Manager can create tasks
        return in_array($user->role, [
            User::ROLE_ADMIN,
            User::ROLE_PROJECT_MANAGER
        ]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Admin can update any task
        if ($user->role === User::ROLE_ADMIN) {
            return true;
        }
        
        // Project Manager can update any task in their projects
        if ($user->role === User::ROLE_PROJECT_MANAGER) {
            return $task->project->users->contains($user->id);
        }
        
        // Developer can only update their own tasks
        if ($user->role === User::ROLE_DEVELOPER) {
            return $task->assigned_to === $user->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Only Admin can delete tasks
        return $user->role === User::ROLE_ADMIN;
    }
}
