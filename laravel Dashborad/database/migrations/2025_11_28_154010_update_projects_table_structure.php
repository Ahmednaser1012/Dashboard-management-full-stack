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
        Schema::table('projects', function (Blueprint $table) {
            // Add description if it doesn't exist
            if (!Schema::hasColumn('projects', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            
            // Add priority if it doesn't exist
            if (!Schema::hasColumn('projects', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])
                    ->nullable()
                    ->after('status');
            }
            
            // Add actual_end_date if it doesn't exist
            if (!Schema::hasColumn('projects', 'actual_end_date')) {
                $table->date('actual_end_date')
                    ->nullable()
                    ->after('end_date');
            }
            
            // Add project_manager_id foreign key if it doesn't exist
            if (!Schema::hasColumn('projects', 'project_manager_id')) {
                $table->foreignId('project_manager_id')
                    ->nullable()
                    ->after('budget')
                    ->constrained('users')
                    ->onDelete('set null');
            }
            
            // Update status enum if needed
            $table->enum('status', ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled'])
                ->default('planned')
                ->change();
                
            // Update progress to be between 0 and 100
            $table->unsignedTinyInteger('progress')
                ->default(0)
                ->change();
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
            
            // Revert status enum to original values
            $table->enum('status', ['pending', 'in_progress', 'on_hold', 'completed'])
                ->default('pending')
                ->change();
                
            // Revert progress to integer
            $table->integer('progress')
                ->default(0)
                ->change();
        });
        
        // Drop columns if they exist
        Schema::table('projects', function (Blueprint $table) {
            $columnsToDrop = ['description', 'priority', 'actual_end_date', 'project_manager_id'];
            $columns = Schema::getColumnListing('projects');
            $columnsToDrop = array_intersect($columnsToDrop, $columns);
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
