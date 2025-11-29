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
        // First, update any invalid status values to a default value
        if (Schema::hasColumn('projects', 'status')) {
            // Get the current status values to check for invalid ones
            $invalidStatuses = DB::table('projects')
                ->whereNotIn('status', ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'])
                ->update(['status' => 'planned']);
        }

        Schema::table('projects', function (Blueprint $table) {
            // Add description if it doesn't exist
            if (!Schema::hasColumn('projects', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            
            // Update status enum to match requirements if the column exists
            if (Schema::hasColumn('projects', 'status')) {
                // First, make the column nullable temporarily to avoid any issues
                $table->string('status')->nullable()->change();
                
                // Then set the new enum values
                $table->enum('status', ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'])
                    ->default('planned')
                    ->nullable(false)
                    ->change();
            }
                
            // Add priority field if it doesn't exist
            if (!Schema::hasColumn('projects', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])
                    ->nullable()
                    ->after('status');
            }
                
            // Add project_manager_id foreign key if it doesn't exist
            if (!Schema::hasColumn('projects', 'project_manager_id')) {
                $table->foreignId('project_manager_id')
                    ->nullable()
                    ->after('created_by')
                    ->constrained('users')
                    ->onDelete('set null');
            }
                
            // Add actual_end_date for tracking when project was actually completed
            if (!Schema::hasColumn('projects', 'actual_end_date')) {
                $table->date('actual_end_date')
                    ->nullable()
                    ->after('end_date');
            }
                
            // Update progress column if it exists
            if (Schema::hasColumn('projects', 'progress')) {
                $table->unsignedTinyInteger('progress')
                    ->default(0)
                    ->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['description', 'priority', 'actual_end_date']);
            $table->dropForeign(['project_manager_id']);
            $table->dropColumn('project_manager_id');
            
            // Revert status enum to original values
            $table->enum('status', ['pending', 'in_progress', 'completed', 'on_hold'])
                ->default('pending')
                ->change();
                
            // Revert progress to integer
            $table->integer('progress')
                ->default(0)
                ->change();
        });
    }
};
