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
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Check if tasks table exists
        if (Schema::hasTable('tasks')) {
            // Drop existing foreign keys using information_schema
            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME 
                FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = 'tasks' 
                AND CONSTRAINT_TYPE = 'FOREIGN KEY'",
                [config('database.connections.mysql.database')]
            );
            
            foreach ($foreignKeys as $key) {
                Schema::table('tasks', function (Blueprint $table) use ($key) {
                    $table->dropForeign($key->CONSTRAINT_NAME);
                });
            }
            
            // Add created_by column if it doesn't exist
            if (!Schema::hasColumn('tasks', 'created_by')) {
                Schema::table('tasks', function (Blueprint $table) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('assigned_to');
                });
            }
            
            // Re-add all necessary foreign keys
            Schema::table('tasks', function (Blueprint $table) {
                // Add created_by foreign key
                $table->foreign('created_by')
                      ->references('id')
                      ->on('users')
                      ->onDelete('cascade');
                
                // Add other foreign keys if they exist
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
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
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
