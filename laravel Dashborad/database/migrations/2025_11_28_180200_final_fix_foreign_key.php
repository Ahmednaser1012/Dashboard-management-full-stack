<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Skip if projects table doesn't exist
        if (!Schema::hasTable('projects')) {
            return;
        }

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            // Try to drop the foreign key if it exists
            DB::statement('ALTER TABLE `projects` DROP FOREIGN KEY IF EXISTS `projects_project_manager_id_foreign`');
            DB::statement('ALTER TABLE `projects` DROP FOREIGN KEY IF EXISTS `projects_projects_project_manager_id_foreign`');
            DB::statement('ALTER TABLE `projects` DROP FOREIGN KEY IF EXISTS `projects_projects_project_manager_id_foreign_foreign`');
            
            // Add the foreign key with the correct name
            DB::statement('ALTER TABLE `projects` 
                ADD CONSTRAINT `projects_project_manager_id_foreign` 
                FOREIGN KEY (`project_manager_id`) 
                REFERENCES `users` (`id`) 
                ON DELETE SET NULL');
                
        } catch (\Exception $e) {
            // Log the error but don't stop execution
            \Log::error('Migration error: ' . $e->getMessage());
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to implement down for a fix migration
    }
};
