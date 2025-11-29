<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop pivot tables first (due to foreign key constraints)
        Schema::dropIfExists('comments');
        Schema::dropIfExists('category_task');
        Schema::dropIfExists('task_user');
        
        // Drop main tables
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('categories');
        
        // Drop role/permission related tables
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        
        // Remove role_id from users table if it exists
        if (Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role_id');
            });
        }
        
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }

    public function down()
    {
        // This is a cleanup migration, so down() is intentionally left empty
        // as we don't want to recreate these tables
    }
};
