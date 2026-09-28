<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SeminarController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;

Route::post('login', [AuthController::class, 'login'])->middleware('throttle:20,1');
Route::post('logout', [AuthController::class, 'logout']);

// Student-facing: PIN disembunyikan, hanya info publik + hitungan kursi
Route::get('seminars/active', function () {
    return \App\Models\Seminar::where('expires_at', '>', now())
        ->withCount(['bookings', 'attendances as valid_attendances_count' => fn($q) => $q->where('status', 'valid')])
        ->with('bookings: id,seminar_id,student_nim,student_name')
        ->orderBy('date_time')
        ->get()
        ->makeHidden(['pin']);
});

Route::get('seminars/filter/{type}', function ($type) {
    abort_unless(in_array($type, ['sempro', 'skripsi']), 422, 'Tipe tidak valid');
    return \App\Models\Seminar::where('type', $type)
        ->where('expires_at', '>', now())
        ->withCount(['bookings', 'attendances as valid_attendances_count' => fn($q) => $q->where('status', 'valid')])
        ->with('bookings:id,seminar_id,student_nim,student_name')
        ->orderBy('date_time')
        ->get()
        ->makeHidden(['pin']);
});

Route::post('bookings', [BookingController::class, 'store'])->middleware('throttle:20,1');
Route::get('bookings/my', [BookingController::class, 'myBookings']);
Route::delete('bookings/{booking}', [BookingController::class, 'cancel']);

Route::get('user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('seminars', SeminarController::class)->except(['update']);
Route::put('seminars/{seminar}', [SeminarController::class, 'update']);
Route::post('seminars/{seminar}/regenerate-pin', [SeminarController::class, 'regeneratePin']);
Route::post('attendances', [AttendanceController::class, 'store'])->middleware('throttle:10,1');
Route::patch('attendances/{attendance}', [AttendanceController::class, 'review']);
Route::get('seminars/{seminar}/attendances', [AttendanceController::class, 'show']);
Route::get('attendances/history', [AttendanceController::class, 'history']);

// Stats per mahasiswa, hanya status valid
Route::get('stats', function (Request $request) {
    $nim = $request->query('student_nim');
    $base = \App\Models\Attendance::where('status', 'valid');
    if ($nim) {
        $base = (clone $base)->where('student_nim', $nim);
        $sempro = (clone $base)->whereHas('seminar', fn($q) => $q->where('type', 'sempro'))->count();
        $skripsi = (clone $base)->whereHas('seminar', fn($q) => $q->where('type', 'skripsi'))->count();
    } else {
        $sempro = (clone $base)->whereHas('seminar', fn($q) => $q->where('type', 'sempro'))->count();
        $skripsi = (clone $base)->whereHas('seminar', fn($q) => $q->where('type', 'skripsi'))->count();
    }
    return ['total' => $sempro + $skripsi, 'sempro' => $sempro, 'skripsi' => $skripsi];
});
