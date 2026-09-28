<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seminar;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SeminarController extends Controller
{
    public function index()
    {
        return Seminar::with(['attendances', 'bookings'])->orderBy('date_time')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'student_name' => 'required|string|max:255',
            'supervisor' => 'nullable|string|max:255',
            'examiner_1' => 'nullable|string|max:255',
            'examiner_2' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:sempro,skripsi',
            'room' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1|max:500',
            'strict_network' => 'nullable|boolean',
            'date_time' => 'required|date_format:Y-m-d H:i:s',
        ]);

        $validated['capacity'] = $validated['capacity'] ?? 30;
        $validated['strict_network'] = (bool) ($validated['strict_network'] ?? false);

        // PIN unik per seminar (hindari collision)
        do {
            $validated['pin'] = Seminar::generatePin();
        } while (Seminar::where('pin', $validated['pin'])->exists());

        $validated['expires_at'] = Carbon::parse($validated['date_time'])->addMinutes(10);

        $seminar = Seminar::create($validated);
        return response()->json($seminar, 201);
    }

    public function show(Seminar $seminar)
    {
        return $seminar->load(['attendances', 'bookings']);
    }

    public function update(Request $request, Seminar $seminar)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'student_name' => 'sometimes|required|string|max:255',
            'supervisor' => 'nullable|string|max:255',
            'examiner_1' => 'nullable|string|max:255',
            'examiner_2' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:sempro,skripsi',
            'room' => 'sometimes|required|string|max:255',
            'capacity' => 'nullable|integer|min:1|max:500',
            'strict_network' => 'nullable|boolean',
            'date_time' => 'sometimes|required|date_format:Y-m-d H:i:s',
        ]);

        if (isset($validated['date_time'])) {
            $validated['expires_at'] = Carbon::parse($validated['date_time'])->addMinutes(10);
        }

        $seminar->update($validated);
        return response()->json($seminar->fresh(['attendances', 'bookings']));
    }

    public function regeneratePin(Seminar $seminar)
    {
        do {
            $pin = Seminar::generatePin();
        } while (Seminar::where('pin', $pin)->where('id', '!=', $seminar->id)->exists());

        $seminar->update(['pin' => $pin, 'expires_at' => Carbon::parse($seminar->date_time)->addMinutes(10)]);
        return response()->json($seminar->fresh());
    }

    public function destroy(Seminar $seminar)
    {
        $seminar->delete();
        return response()->noContent();
    }
}
