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
        // First, remove any existing foreign key constraint
        try {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropForeign(['project_manager_id']);
            });
        } catch (\Exception $e) {
            // Ignore the error if the foreign key doesn't exist
        }

        // Now add the foreign key constraint properly
        Schema::table('projects', function (Blueprint $table) {
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
        //
    }
};
