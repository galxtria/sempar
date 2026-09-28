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
        Schema::table('seminars', function (Blueprint $table) {
            $table->boolean('strict_network')->default(false)->after('capacity');
        });
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('review_note', 255)->nullable()->after('ip_address');
        });
    }

    public function down(): void
    {
        Schema::table('seminars', function (Blueprint $table) {
            $table->dropColumn('strict_network');
        });
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('review_note');
        });
    }
};
