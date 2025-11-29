<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'start_date',
        'end_date',
        'actual_end_date',
        'progress',
        'budget',
        'project_manager_id',
        'created_by'
    ];

    protected $appends = [
        'formatted_budget',
        'days_remaining',
        'is_overdue',
        'progress_percentage'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'actual_end_date' => 'date',
        'progress' => 'integer',
        'budget' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Status constants
    public const STATUS_PLANNED = 'planned';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_ON_HOLD = 'on_hold';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    // Priority constants
    public const PRIORITY_LOW = 'low';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_CRITICAL = 'critical';

    /**
     * Get the project manager for the project.
     */
    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /**
     * Get the team members for the project.
     */
    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_team');
    }

    /**
     * Get the user who created the project.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all possible statuses with their labels.
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_PLANNED => 'Planned',
            self::STATUS_IN_PROGRESS => 'In Progress',
            self::STATUS_ON_HOLD => 'On Hold',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
        ];
    }

    /**
     * Get all possible priorities with their labels.
     */
    public static function getPriorities(): array
    {
        return [
            self::PRIORITY_LOW => 'Low',
            self::PRIORITY_MEDIUM => 'Medium',
            self::PRIORITY_HIGH => 'High',
            self::PRIORITY_CRITICAL => 'Critical',
        ];
    }

    /**
     * Get the status label for the current project.
     */
    public function getStatusLabelAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }

    /**
     * Get the priority label for the current project.
     */
    public function getPriorityLabelAttribute(): ?string
    {
        return $this->priority ? (self::getPriorities()[$this->priority] ?? $this->priority) : null;
    }

    /**
     * Check if the current user can update the project progress
     */
    public function canUpdateProgress($user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Get the validation rules for the project
     */
    public static function rules($projectId = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:' . implode(',', array_keys(self::getStatuses())),
            'priority' => 'nullable|in:' . implode(',', array_keys(self::getPriorities())),
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'progress' => 'required|integer|min:0|max:100',
            'budget' => 'nullable|numeric|min:0',
            'project_manager_id' => 'required|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:users,id',
        ];
    }

    /**
     * Scope a query to only include projects for a specific project manager.
     */
    public function scopeForProjectManager($query, $userId)
    {
        return $query->where('project_manager_id', $userId);
    }

    /**
     * Scope a query to only include projects where the user is a team member.
     */
    public function scopeForTeamMember($query, $userId)
    {
        return $query->whereHas('teamMembers', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeOnHold($query)
    {
        return $query->where('status', self::STATUS_ON_HOLD);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeHighPriority($query)
    {
        return $query->where('priority', self::PRIORITY_HIGH);
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });
    }

    // Accessors & Mutators
    public function getFormattedBudgetAttribute(): string
    {
        return '$' . number_format($this->budget, 2);
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if ($this->status === self::STATUS_COMPLETED) {
            return 0;
        }

        return Carbon::now()->diffInDays(Carbon::parse($this->end_date), false);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->end_date < now() && $this->status !== self::STATUS_COMPLETED;
    }

    public function getProgressPercentageAttribute(): int
    {
        try {
            $totalTasks = $this->tasks_count ?? $this->tasks()->count();
            
            if (empty($totalTasks) || $totalTasks === 0) {
                return 0;
            }

            $completedTasks = $this->tasks()->where('status', 'completed')->count();
            
            return (int) round(($completedTasks / $totalTasks) * 100);
        } catch (\Exception $e) {
            \Log::error('Error calculating project progress: ' . $e->getMessage());
            return 0;
        }
    }
}
