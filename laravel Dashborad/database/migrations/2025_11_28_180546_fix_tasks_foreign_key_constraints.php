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
        Schema::table('tasks', function (Blueprint $table) {
            // First, drop the foreign key constraint if it exists
            if (Schema::hasColumn('tasks', 'created_by')) {
                // Check if foreign key exists before trying to drop it
                $table->dropForeign(['created_by']);
                // Now we can safely drop the column
                $table->dropColumn('created_by');
            }
            
            // Add the column back with proper configuration
            $table->unsignedBigInteger('created_by')->after('assigned_to');
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['created_by']);
            // Then drop the column
            $table->dropColumn('created_by');
        });
    }
};
