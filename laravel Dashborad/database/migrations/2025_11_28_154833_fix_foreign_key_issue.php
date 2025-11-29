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
        
        // Drop the foreign key if it exists
        DB::statement('ALTER TABLE projects DROP FOREIGN KEY IF EXISTS projects_project_manager_id_foreign');
        
        // Re-add the foreign key
        DB::statement('ALTER TABLE projects 
            ADD CONSTRAINT projects_project_manager_id_foreign 
            FOREIGN KEY (project_manager_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL');
            
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
