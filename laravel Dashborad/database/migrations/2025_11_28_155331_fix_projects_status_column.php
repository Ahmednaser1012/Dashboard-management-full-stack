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
        // First, drop the existing status column if it exists
        if (Schema::hasColumn('projects', 'status')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }

        // Add the status column with the correct enum values
        Schema::table('projects', function (Blueprint $table) {
            $table->enum('status', ['pending', 'in_progress', 'completed', 'on_hold'])
                  ->default('pending')
                  ->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the changes if needed
        if (Schema::hasColumn('projects', 'status')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
