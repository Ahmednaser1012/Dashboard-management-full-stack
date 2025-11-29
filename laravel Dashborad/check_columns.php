<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check projects table columns and their types
echo "Projects table columns and types:\n";
$columns = Schema::getConnection()->getDoctrineSchemaManager()->listTableColumns('projects');
foreach ($columns as $column) {
    echo $column->getName() . ': ' . $column->getType()->getName() . '\n';
    if ($column->getType()->getName() === 'string') {
        echo '  Length: ' . $column->getLength() . '\n';
    }
    if ($column->getDefault() !== null) {
        echo '  Default: ' . $column->getDefault() . '\n';
    }
    if ($column->getNotnull()) {
        echo '  Not Null\n';
    }
    echo '\n';
}

// Check enum values if any
$enumColumns = DB::select("SELECT COLUMN_NAME, COLUMN_TYPE 
                         FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE TABLE_SCHEMA = DATABASE() 
                         AND TABLE_NAME = 'projects' 
                         AND DATA_TYPE = 'enum'");

echo "\nEnum columns in projects table:\n";
foreach ($enumColumns as $column) {
    echo $column->COLUMN_NAME . ': ' . $column->COLUMN_TYPE . "\n";
}
