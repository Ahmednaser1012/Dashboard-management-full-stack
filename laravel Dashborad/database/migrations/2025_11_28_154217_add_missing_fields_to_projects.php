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
        // Add description column if it doesn't exist
        if (!Schema::hasColumn('projects', 'description')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->text('description')->nullable()->after('name');
            });
        }
        
        // Add priority column if it doesn't exist
        if (!Schema::hasColumn('projects', 'priority')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])
                    ->nullable()
                    ->after('status');
            });
        }
        
        // Add actual_end_date column if it doesn't exist
        if (!Schema::hasColumn('projects', 'actual_end_date')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->date('actual_end_date')
                    ->nullable()
                    ->after('end_date');
            });
        }
        
        // Add project_manager_id column if it doesn't exist
        if (!Schema::hasColumn('projects', 'project_manager_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->foreignId('project_manager_id')
                    ->nullable()
                    ->after('budget')
                    ->constrained('users')
                    ->onDelete('set null');
            });
        }
        
        // Update status enum if it exists
        if (Schema::hasColumn('projects', 'status')) {
            DB::statement("ALTER TABLE projects MODIFY status ENUM('planned', 'in_progress', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planned'");
        }
        
        // Update progress to unsigned tinyint if it exists
        if (Schema::hasColumn('projects', 'progress')) {
            DB::statement('ALTER TABLE projects MODIFY progress TINYINT UNSIGNED NOT NULL DEFAULT 0');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key first
        if (Schema::hasColumn('projects', 'project_manager_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropForeign(['project_manager_id']);
            });
        }
        
        // Drop the columns if they exist
        $columnsToCheck = ['description', 'priority', 'actual_end_date', 'project_manager_id'];
        $existingColumns = Schema::getColumnListing('projects');
        $columnsToDrop = array_intersect($columnsToCheck, $existingColumns);
        
        if (!empty($columnsToDrop)) {
            Schema::table('projects', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
        
        // Revert status enum if it exists
        if (Schema::hasColumn('projects', 'status')) {
            DB::statement("ALTER TABLE projects MODIFY status ENUM('pending', 'in_progress', 'on_hold', 'completed') NOT NULL DEFAULT 'pending'");
        }
        
        // Revert progress to int if it exists
        if (Schema::hasColumn('projects', 'progress')) {
            DB::statement('ALTER TABLE projects MODIFY progress INT NOT NULL DEFAULT 0');
        }
    }
};
