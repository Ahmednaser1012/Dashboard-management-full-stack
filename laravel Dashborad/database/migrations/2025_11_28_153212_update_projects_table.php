<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, create the enum type if it doesn't exist
        DB::statement("ALTER TABLE projects MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') NOT NULL DEFAULT 'pending'");

        Schema::table('projects', function (Blueprint $table) {
            // Add description if not exists
            if (!Schema::hasColumn('projects', 'description')) {
                $table->text('description')->nullable()->after('name');
            }

            // Add priority if not exists
            if (!Schema::hasColumn('projects', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'critical'])->nullable()->after('status');
            }

            // Add project manager foreign key
            if (!Schema::hasColumn('projects', 'project_manager_id')) {
                $table->foreignId('project_manager_id')->nullable()->constrained('users')->after('created_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('projects', 'priority')) {
                $table->dropColumn('priority');
            }
            if (Schema::hasColumn('projects', 'project_manager_id')) {
                $table->dropForeign(['project_manager_id']);
                $table->dropColumn('project_manager_id');
            }
        });

        // Revert the status enum
        DB::statement("ALTER TABLE projects MODIFY COLUMN status ENUM('pending', 'in_progress', 'completed', 'on_hold') NOT NULL DEFAULT 'pending'");
    }
};
