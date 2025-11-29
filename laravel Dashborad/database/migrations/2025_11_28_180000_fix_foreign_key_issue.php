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
        // Fix foreign key constraint issue
        Schema::table('projects', function (Blueprint $table) {
            // Get the actual foreign key constraint name
            $connection = DB::connection();
            $databaseName = $connection->getDatabaseName();
            $foreignKey = $connection->selectOne(
                "SELECT CONSTRAINT_NAME 
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                 WHERE REFERENCED_TABLE_SCHEMA = '{$databaseName}'
                 AND TABLE_NAME = 'projects'
                 AND COLUMN_NAME = 'project_manager_id'"
            );

            // If foreign key exists, drop it
            if ($foreignKey && $foreignKey->CONSTRAINT_NAME) {
                $table->dropForeign($foreignKey->CONSTRAINT_NAME);
            }

            // Re-add the foreign key with a proper name
            $table->foreign('project_manager_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a fix migration, no need to implement down
    }
};
