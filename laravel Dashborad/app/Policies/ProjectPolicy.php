<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view projects
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        // Admin and Project Manager can view all projects
        // Developer can only view projects they are assigned to
        return $user->role === User::ROLE_ADMIN || 
               $user->role === User::ROLE_PROJECT_MANAGER ||
               $project->users->contains($user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only Admin and Project Manager can create projects
        return in_array($user->role, [
            User::ROLE_ADMIN,
            User::ROLE_PROJECT_MANAGER
        ]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        // Only Admin and Project Manager can update projects
        return in_array($user->role, [
            User::ROLE_ADMIN,
            User::ROLE_PROJECT_MANAGER
        ]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        // Only Admin can delete projects
        return $user->role === User::ROLE_ADMIN;
    }
}
