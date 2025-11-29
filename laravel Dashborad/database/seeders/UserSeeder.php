<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Add role column if not exists
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function ($table) {
                $table->enum('role', ['admin', 'project_manager', 'developer'])->default('developer')->after('email');
            });
        }

        // Disable foreign key checks
        Schema::disableForeignKeyConstraints();
        
        // Clear existing users
        DB::table('users')->truncate();
        
        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();

        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('12345678'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create project manager user
        User::create([
            'name' => 'Project Manager',
            'email' => 'pm@pm.com',
            'password' => Hash::make('12345678'),
            'role' => 'project_manager',
            'email_verified_at' => now(),
        ]);

        // Create developer users
        for ($i = 1; $i <= 3; $i++) {
            User::create([
                'name' => 'Developer ' . $i,
                'email' => 'dev' . $i . '@dev.com',
                'password' => Hash::make('12345678'),
                'role' => 'developer',
                'email_verified_at' => now(),
            ]);
        }

        // Create more project managers
        for ($i = 2; $i <= 3; $i++) {
            User::create([
                'name' => 'Project Manager ' . $i,
                'email' => 'pm' . $i . '@pm.com',
                'password' => Hash::make('12345678'),
                'role' => 'project_manager',
                'email_verified_at' => now(),
            ]);
        }

        // Create a few more admins
        User::create([
            'name' => 'Developer',
            'email' => 'dev@dev.com',
            'password' => Hash::make('12345678'),
            'role' => 'developer',
            'email_verified_at' => now(),
        ]);
    }
}
