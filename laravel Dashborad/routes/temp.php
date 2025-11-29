<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/temp/check-tasks-table', function() {
    $columns = DB::select('SHOW COLUMNS FROM tasks');
    return response()->json($columns);
});
