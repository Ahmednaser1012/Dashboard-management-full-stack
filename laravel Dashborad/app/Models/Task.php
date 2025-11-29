<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'project_id',
        'assigned_to',
        'due_date',
        'estimated_hours',
        'created_by'
    ];

    protected $casts = [
        'due_date' => 'date',
        'estimated_hours' => 'decimal:2',
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created the task
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Alias for assignee relationship for backward compatibility
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    // Scopes
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        })->when($filters['priority'] ?? null, function ($query, $priority) {
            $query->where('priority', $priority);
        })->when($filters['assigned_to'] ?? null, function ($query, $assignedTo) {
            $query->where('assigned_to', $assignedTo);
        });
    }
}
