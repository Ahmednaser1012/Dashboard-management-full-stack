<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix tasks table
        if (Schema::hasTable('tasks')) {
            // Drop foreign key constraints if they exist
            Schema::table('tasks', function (Blueprint $table) {
                // Drop foreign keys
                $foreignKeys = [
                    'tasks_created_by_foreign',
                    'tasks_assigned_to_foreign',
                    'tasks_project_id_foreign'
                ];
                
                foreach ($foreignKeys as $key) {
                    if (Schema::hasColumn('tasks', str_replace('tasks_', '', str_replace('_foreign', '', $key)))) {
                        try {
                            $table->dropForeign([str_replace('tasks_', '', str_replace('_foreign', '', $key))]);
                        } catch (\Exception $e) {
                            // Ignore if foreign key doesn't exist
                        }
                    }
                }
                
                // Add created_by column if it doesn't exist
                if (!Schema::hasColumn('tasks', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('assigned_to');
                    
                    // Add foreign key constraint
                    $table->foreign('created_by')
                          ->references('id')
                          ->on('users')
                          ->onDelete('cascade');
                }
                
                // Re-add other foreign keys
                if (Schema::hasColumn('tasks', 'assigned_to')) {
                    $table->foreign('assigned_to')
                          ->references('id')
                          ->on('users')
                          ->onDelete('cascade');
                }
                
                if (Schema::hasColumn('tasks', 'project_id')) {
                    $table->foreign('project_id')
                          ->references('id')
                          ->on('projects')
                          ->onDelete('cascade');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a fix migration, so we don't need to implement down()
        // as it's not meant to be rolled back
    }
};
