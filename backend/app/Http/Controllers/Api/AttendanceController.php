<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Seminar;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'seminar_id' => 'required|exists:seminars,id',
            'student_nim' => 'required|string',
            'student_name' => 'required|string',
            'pin' => 'required|string|size:4',
            'summary' => 'required|string|min:10',
        ]);

        $seminar = Seminar::findOrFail($validated['seminar_id']);

        if (now()->lessThan($seminar->date_time)) {
            return response()->json(['error' => 'Seminar belum dimulai. Presensi dibuka saat acara berlangsung.'], 422);
        }

        if ($seminar->pin !== $validated['pin']) {
            return response()->json(['error' => 'Kode PIN tidak sesuai. Periksa kembali PIN yang diumumkan panitia.'], 422);
        }

        if (now()->greaterThan($seminar->expires_at)) {
            return response()->json(['error' => 'PIN telah kedaluwarsa. PIN hanya aktif 10 menit setelah acara dimulai.'], 422);
        }

        $exists = Attendance::where('seminar_id', $validated['seminar_id'])
            ->where('student_nim', $validated['student_nim'])
            ->whereIn('status', ['valid', 'pending'])
            ->exists();
        if ($exists) {
            return response()->json(['error' => 'NIM ini sudah melakukan presensi untuk seminar ini.'], 422);
        }

        $aiResult = app('gemini')->validateSummary($validated['summary'], $seminar->title);
        $status = $aiResult === null ? 'pending' : ($aiResult ? 'valid' : 'rejected');

        // Jika pernah ditolak, perbarui baris yang sama agar bisa mencoba lagi
        $attendance = Attendance::where('seminar_id', $validated['seminar_id'])
            ->where('student_nim', $validated['student_nim'])
            ->where('status', 'rejected')
            ->first();

        $payload = [
            'seminar_id' => $validated['seminar_id'],
            'student_nim' => $validated['student_nim'],
            'student_name' => $validated['student_name'],
            'summary' => $validated['summary'],
            'status' => $status,
        ];

        if ($attendance) {
            $attendance->update($payload);
        } else {
            $attendance = Attendance::create($payload);
        }

        if ($status === 'pending') {
            return response()->json(['message' => 'Kehadiran diterima dan menunggu verifikasi panitia.', 'attendance' => $attendance], 201);
        }
        if ($status === 'rejected') {
            return response()->json(['error' => 'Ringkasan tidak relevan dengan judul seminar. Tulis 1-2 kalimat yang nyambung, lalu kirim ulang.', 'attendance' => $attendance], 422);
        }

        return response()->json(['message' => 'Kehadiran berhasil dicatat', 'attendance' => $attendance], 201);
    }

    public function show(Seminar $seminar)
    {
        return $seminar->attendances()->orderByDesc('created_at')->get();
    }

    // Review manual oleh panitia untuk status pending
    public function review(Request $request, Attendance $attendance)
    {
        $validated = $request->validate(['status' => 'required|in:valid,rejected']);
        $attendance->update(['status' => $validated['status']]);
        return response()->json($attendance);
    }

    public function history(Request $request)
    {
        $validated = $request->validate(['student_nim' => 'required|string']);
        return Attendance::where('student_nim', $validated['student_nim'])
            ->where('status', 'valid')
            ->with('seminar:id,title,type,room,date_time')
            ->orderByDesc('created_at')
            ->get();
    }
}
