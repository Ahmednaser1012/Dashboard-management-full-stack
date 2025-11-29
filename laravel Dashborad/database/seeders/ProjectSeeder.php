<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have at least 1 project manager and 3 developers
        if (User::where('role', 'project_manager')->count() < 1) {
            User::factory()->create([
                'name' => 'Project Manager ' . (User::where('role', 'project_manager')->count() + 1),
                'email' => 'pm' . (User::where('role', 'project_manager')->count() + 1) . '@example.com',
                'password' => bcrypt('password'),
                'role' => 'project_manager',
                'email_verified_at' => now(),
            ]);
        }

        // Ensure we have at least 3 developers
        while (User::where('role', 'developer')->count() < 3) {
            User::factory()->create([
                'name' => 'Developer ' . (User::where('role', 'developer')->count() + 1),
                'email' => 'dev' . (User::where('role', 'developer')->count() + 1) . '@example.com',
                'password' => bcrypt('password'),
                'role' => 'developer',
                'email_verified_at' => now(),
            ]);
        }

        $projectManagers = User::where('role', 'project_manager')->get();
        $developers = User::where('role', 'developer')->get();

        // Create projects
        for ($i = 1; $i <= 5; $i++) {
            $project = Project::create([
                'name' => 'Project ' . $i,
                'status' => ['pending', 'in_progress', 'completed', 'on_hold'][array_rand([0, 1, 2, 3])],
                'priority' => ['low', 'medium', 'high'][array_rand([0, 1, 2])],
                'start_date' => now()->subDays(rand(1, 30)),
                'end_date' => now()->addDays(rand(30, 90)),
                'progress' => rand(0, 100),
                'budget' => rand(10000, 100000),
                'project_manager_id' => $projectManagers->random()->id,
                'created_by' => $projectManagers->random()->id,
            ]);

            // Create tasks for each project
            for ($j = 1; $j <= rand(5, 15); $j++) {
                $task = Task::create([
                    'project_id' => $project->id,
                    'title' => 'Task ' . $j . ' for Project ' . $i,
                    'description' => 'This is a sample task description for Task ' . $j . ' in Project ' . $i,
                    'status' => ['todo', 'doing', 'done'][array_rand([0, 1, 2])],
                    'priority' => ['low', 'medium', 'high'][array_rand([0, 1, 2])],
                    'assigned_to' => $developers->random()->id,
                    'created_by' => $projectManagers->random()->id,
                    'due_date' => now()->addDays(rand(1, 60)),
                ]);

                // Assign additional users to the task
                $task->users()->attach(
                    $developers->random(rand(1, 3))->pluck('id')->toArray()
                );
            }
        }
    }
}
