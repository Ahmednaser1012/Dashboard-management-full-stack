<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'actual_end_date' => $this->actual_end_date,
            'budget' => $this->budget,
            'formatted_budget' => $this->formatted_budget,
            'progress' => $this->progress,
            'progress_percentage' => $this->progress_percentage,
            'days_remaining' => $this->days_remaining,
            'is_overdue' => $this->is_overdue,
            'created_by' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                    'email' => $this->creator->email
                ];
            }),
            'project_manager' => $this->whenLoaded('projectManager', function () {
                return $this->projectManager ? [
                    'id' => $this->projectManager->id,
                    'name' => $this->projectManager->name,
                    'email' => $this->projectManager->email
                ] : null;
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
