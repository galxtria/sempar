<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seminars', function (Blueprint $table) {
            $table->string('supervisor')->nullable()->after('student_name');
            $table->string('examiner_1')->nullable()->after('supervisor');
            $table->string('examiner_2')->nullable()->after('examiner_1');
            $table->text('description')->nullable()->after('examiner_2');
        });
    }

    public function down(): void
    {
        Schema::table('seminars', function (Blueprint $table) {
            $table->dropColumn(['supervisor', 'examiner_1', 'examiner_2', 'description']);
        });
    }
};

