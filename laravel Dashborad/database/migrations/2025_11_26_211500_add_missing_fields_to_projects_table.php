<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('projects', function (Blueprint $table) {
            // Add description field
            if (!Schema::hasColumn('projects', 'description')) {
                $table->text('description')->nullable();
            }
            
            // Add client_name field
            if (!Schema::hasColumn('projects', 'client_name')) {
                $table->string('client_name')->nullable();
            }
            
            // Add priority field
            if (!Schema::hasColumn('projects', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            }
            
            // Add actual_end_date field
            if (!Schema::hasColumn('projects', 'actual_end_date')) {
                $table->date('actual_end_date')->nullable();
            }
            
            // Add notes field
            if (!Schema::hasColumn('projects', 'notes')) {
                $table->text('notes')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'client_name',
                'priority',
                'actual_end_date',
                'notes'
            ]);
        });
    }
};
