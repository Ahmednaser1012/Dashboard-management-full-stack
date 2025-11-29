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
        // First, let's check which columns already exist
        $columns = [
            'description' => function ($table) {
                $table->text('description')->nullable()->after('name');
            },
            'priority' => function ($table) {
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])
                    ->nullable()
                    ->after('status');
            },
            'actual_end_date' => function ($table) {
                $table->date('actual_end_date')
                    ->nullable()
                    ->after('end_date');
            },
            'project_manager_id' => function ($table) {
                $table->foreignId('project_manager_id')
                    ->nullable()
                    ->after('budget')
                    ->constrained('users')
                    ->onDelete('set null');
            }
        ];

        // Only add columns that don't exist
        Schema::table('projects', function (Blueprint $table) use ($columns) {
            foreach ($columns as $column => $callback) {
                if (!Schema::hasColumn('projects', $column)) {
                    $callback($table);
                }
            }
            
            // Update status enum if needed
            if (Schema::hasColumn('projects', 'status')) {
                $table->enum('status', ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'])
                    ->default('planned')
                    ->change();
            }
            
            // Update progress to be between 0 and 100 if it exists
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
            // Drop the foreign key first
            if (Schema::hasColumn('projects', 'project_manager_id')) {
                $table->dropForeign(['project_manager_id']);
            }
            
            // Revert status enum to original values if it exists
            if (Schema::hasColumn('projects', 'status')) {
                $table->enum('status', ['pending', 'in_progress', 'on_hold', 'completed'])
                    ->default('pending')
                    ->change();
            }
            
            // Revert progress to integer if it exists
            if (Schema::hasColumn('projects', 'progress')) {
                $table->integer('progress')
                    ->default(0)
                    ->change();
            }
        });
        
        // Drop columns if they exist
        Schema::table('projects', function (Blueprint $table) {
            $columnsToDrop = ['description', 'priority', 'actual_end_date', 'project_manager_id'];
            $existingColumns = Schema::getColumnListing('projects');
            $columnsToDrop = array_intersect($columnsToDrop, $existingColumns);
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
