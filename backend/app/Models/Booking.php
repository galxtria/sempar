<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = ['seminar_id', 'student_nim', 'student_name'];

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class);
    }
}
