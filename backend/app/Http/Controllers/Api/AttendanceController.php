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
            'summary' => 'nullable|string|max:2000',
        ]);

        $summary = trim($validated['summary'] ?? '');

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

        $hasBooking = \App\Models\Booking::where('seminar_id', $validated['seminar_id'])
            ->where('student_nim', $validated['student_nim'])
            ->exists();
        if (!$hasBooking) {
            return response()->json(['error' => 'Anda belum melakukan reservasi kursi untuk seminar ini. Reservasi dulu sebelum mencatat kehadiran.'], 422);
        }

        $exists = Attendance::where('seminar_id', $validated['seminar_id'])
            ->where('student_nim', $validated['student_nim'])
            ->whereIn('status', ['valid', 'pending'])
            ->exists();
        if ($exists) {
            return response()->json(['error' => 'NIM ini sudah melakukan presensi untuk seminar ini.'], 422);
        }

        // Ringkasan opsional: kosong = langsung valid, diisi = dicek AI
        if ($summary === '') {
            $status = 'valid';
            $reviewNote = null;
        } else {
            $aiResult = app('gemini')->validateSummary($summary, $seminar->title);
            $status = $aiResult === null ? 'pending' : ($aiResult ? 'valid' : 'rejected');
            $reviewNote = $aiResult === null ? 'AI tidak dapat memastikan, perlu review manual.' : null;
        }

        // Mode jaringan kampus: di luar IP kampus = pending + catatan (bukan tolak langsung,
        // karena mahasiswa sah bisa sedang memakai data seluler di ruangan)
        $clientIp = $request->ip();
        if ($status === 'valid' && $seminar->strict_network && !$this->isCampusIp($clientIp)) {
            $status = 'pending';
            $reviewNote = 'Di luar jaringan kampus (' . $clientIp . ').';
        }

        // Jika pernah ditolak, perbarui baris yang sama agar bisa mencoba lagi
        $attendance = Attendance::where('seminar_id', $validated['seminar_id'])
            ->where('student_nim', $validated['student_nim'])
            ->where('status', 'rejected')
            ->first();

        $payload = [
            'seminar_id' => $validated['seminar_id'],
            'student_nim' => $validated['student_nim'],
            'student_name' => $validated['student_name'],
            'summary' => $summary,
            'status' => $status,
            'ip_address' => $request->ip(),
            'review_note' => $reviewNote ?? null,
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

    // Daftar IP / CIDR jaringan kampus dari env CAMPUS_IPS (koma). Loopback selalu lolos (testing).
    private function isCampusIp(?string $ip): bool
    {
        if (!$ip || $ip === '127.0.0.1' || $ip === '::1') {
            return true;
        }
        $ranges = array_filter(array_map('trim', explode(',', (string) env('CAMPUS_IPS', ''))));
        foreach ($ranges as $range) {
            if (str_contains($range, '/')) {
                [$subnet, $bits] = explode('/', $range, 2);
                $ipLong = ip2long($ip);
                $subLong = ip2long($subnet);
                if ($ipLong === false || $subLong === false) {
                    continue;
                }
                $mask = -1 << (32 - (int) $bits);
                if (($ipLong & $mask) === ($subLong & $mask)) {
                    return true;
                }
            } elseif ($ip === $range) {
                return true;
            }
        }
        return false;
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
