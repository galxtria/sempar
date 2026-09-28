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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seminar_id')->constrained()->onDelete('cascade');
            $table->string('student_nim');
            $table->string('student_name');
            $table->timestamps();
            $table->unique(['seminar_id', 'student_nim']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
