<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Seminar;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'seminar_id' => 'required|exists:seminars,id',
            'student_nim' => 'required|string|max:32',
            'student_name' => 'required|string|max:255',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            $seminar = Seminar::lockForUpdate()->findOrFail($validated['seminar_id']);
            $capacity = $seminar->capacity ?? 30;

            if (now()->greaterThan($seminar->expires_at)) {
                return response()->json(['error' => 'Pendaftaran seminar ini telah ditutup.'], 422);
            }

            $exists = Booking::where('seminar_id', $validated['seminar_id'])
                ->where('student_nim', $validated['student_nim'])
                ->exists();

            if ($exists) {
                return response()->json(['error' => 'Anda sudah terdaftar pada seminar ini.'], 422);
            }

            $booked = $seminar->bookings()->count();
            if ($booked >= $capacity) {
                return response()->json(['error' => 'Kapasitas ruangan telah penuh. Silakan pilih seminar lain.'], 422);
            }

            $booking = Booking::create($validated);
            return response()->json([
                'message' => 'Reservasi kursi berhasil.',
                'booking' => $booking,
                'remaining' => $capacity - $booked - 1
            ], 201);
        });
    }

    public function cancel(Request $request, Booking $booking)
    {
        $validated = $request->validate(['student_nim' => 'required|string']);
        if ($booking->student_nim !== $validated['student_nim']) {
            return response()->json(['error' => 'Anda tidak memiliki akses ke reservasi ini.'], 403);
        }
        $booking->delete();
        return response()->noContent();
    }

    public function myBookings(Request $request)
    {
        $validated = $request->validate(['student_nim' => 'required|string|max:32']);
        return Booking::where('student_nim', $validated['student_nim'])->with('seminar')->orderByDesc('created_at')->get();
    }
}
