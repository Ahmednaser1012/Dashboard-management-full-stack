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
            // Check if the column already exists
            if (!Schema::hasColumn('tasks', 'created_by')) {
                // Add the created_by column
                $table->unsignedBigInteger('created_by')->after('assigned_to');
                
                // Add foreign key constraint
                $table->foreign('created_by')
                      ->references('id')
                      ->on('users')
                      ->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Drop the foreign key constraint if it exists
            if (Schema::hasColumn('tasks', 'created_by')) {
                $table->dropForeign(['created_by']);
                $table->dropColumn('created_by');
            }
        });
    }
};
