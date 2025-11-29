<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'in_progress', 'completed', 'on_hold'];
        $startDate = $this->faker->dateTimeBetween('-1 year', '+1 year');
        $endDate = $this->faker->dateTimeBetween($startDate, '+1 year');

        return [
            'name' => $this->faker->sentence(3),
            'status' => $this->faker->randomElement($statuses),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'progress' => $this->faker->numberBetween(0, 100),
            'budget' => $this->faker->randomFloat(2, 1000, 100000),
            'created_by' => User::factory(),
        ];
    }
}
