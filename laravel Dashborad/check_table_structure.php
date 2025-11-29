<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check projects table structure
try {
    $columns = Schema::getColumnListing('projects');
    echo "Columns in projects table:\n";
    print_r($columns);
    
    // Get foreign keys
    $connection = DB::connection();
    $databaseName = $connection->getDatabaseName();
    $foreignKeys = $connection->select(
        "SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
         FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
         WHERE REFERENCED_TABLE_SCHEMA = '{$databaseName}'
         AND TABLE_NAME = 'projects'"
    );
    
    echo "\nForeign keys in projects table:\n";
    print_r($foreignKeys);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
