<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Demo accounts dibaca dari environment (.env) — JANGAN hardcode password di repo.
    // Lihat backend/.env.example untuk daftar key yang dibutuhkan.
    private function users(): array
    {
        return array_values(array_filter([
            $this->demoUser(env('DEMO_STUDENT_NIM'), env('DEMO_STUDENT_PASS'), env('DEMO_STUDENT_NAME', 'Mahasiswa'), 'mahasiswa'),
            $this->demoUser(env('DEMO_LECTURER_USER'), env('DEMO_LECTURER_PASS'), env('DEMO_LECTURER_NAME', 'Dosen Pembimbing'), 'dosen'),
            $this->demoUser(env('DEMO_ADMIN_USER'), env('DEMO_ADMIN_PASS'), env('DEMO_ADMIN_NAME', 'Admin'), 'admin'),
        ]));
    }

    private function demoUser($username, $password, $name, $role): ?array
    {
        if (!$username || !$password) {
            return null;
        }
        return ['username' => $username, 'password' => $password, 'name' => $name, 'role' => $role];
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = collect($this->users())->first(fn($u) => $u['username'] === $validated['username']);

        if (!$user || !hash_equals($user['password'], $validated['password'])) {
            return response()->json(['error' => 'Username atau password salah'], 401);
        }

        $token = base64_encode($user['username'] . ':' . $user['role']);
        
        return response()->json([
            'token' => $token,
            'role' => $user['role'],
            'username' => $user['username'],
            'name' => $user['name']
        ]);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'logged out']);
    }
}

