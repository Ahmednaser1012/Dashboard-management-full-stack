<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    // Role constants
    public const ROLE_ADMIN = 'admin';
    public const ROLE_PROJECT_MANAGER = 'project_manager';
    public const ROLE_DEVELOPER = 'developer';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get all available roles
     */
    public static function getRoles(): array
    {
        return [
            self::ROLE_ADMIN => 'Administrator',
            self::ROLE_PROJECT_MANAGER => 'Project Manager',
            self::ROLE_DEVELOPER => 'Developer',
        ];
    }

    // Relationships
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function managedProjects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot('role')
            ->wherePivot('role', 'manager')
            ->withTimestamps();
    }

    // Role check methods
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isProjectManager(): bool
    {
        return $this->role === self::ROLE_PROJECT_MANAGER;
    }

    public function isDeveloper(): bool
    {
        return $this->role === self::ROLE_DEVELOPER;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user can manage a project
     */
    public function canManageProject(Project $project): bool
    {
        return $this->isAdmin() || 
               $this->isProjectManager() && $this->id === $project->created_by;
    }

    /**
     * Check if user can view a project
     */
    public function canViewProject(Project $project): bool
    {
        return $this->isAdmin() || 
               $this->isProjectManager() ||
               $this->managedProjects()->where('project_id', $project->id)->exists() ||
               $this->assignedTasks()->where('project_id', $project->id)->exists();
    }
}
