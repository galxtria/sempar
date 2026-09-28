<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Hardcoded users (demo): mahasiswa, dosen pembimbing/penguji, admin akademik
    private $users = [
        ['username' => '2401010101', 'password' => '***REMOVED***', 'name' => 'Mahasiswa', 'role' => 'mahasiswa'],
        ['username' => 'dosen@sempar.id', 'password' => '***REMOVED***', 'name' => 'Dosen Pembimbing', 'role' => 'dosen'],
        ['username' => 'admin@sempar.id', 'password' => '***REMOVED***', 'name' => 'Admin', 'role' => 'admin'],
    ];

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = collect($this->users)->first(fn($u) => $u['username'] === $validated['username']);

        if (!$user || $user['password'] !== $validated['password']) {
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

