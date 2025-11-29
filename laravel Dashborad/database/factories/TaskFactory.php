<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['todo', 'doing', 'done'];
        $priorities = ['low', 'medium', 'high'];
        $dueDate = $this->faker->dateTimeBetween('now', '+3 months');

        return [
            'project_id' => Project::factory(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph,
            'status' => $this->faker->randomElement($statuses),
            'priority' => $this->faker->randomElement($priorities),
            'assigned_to' => User::factory(),
            'created_by' => User::factory(),
            'due_date' => $dueDate,
        ];
    }
}
