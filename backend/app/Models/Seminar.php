<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seminar extends Model
{
    protected $fillable = ['title', 'student_name', 'supervisor', 'examiner_1', 'examiner_2', 'description', 'type', 'room', 'date_time', 'pin', 'expires_at', 'capacity'];
    
    protected $casts = ['date_time' => 'datetime', 'expires_at' => 'datetime'];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public static function generatePin(): string
    {
        return str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }
}
