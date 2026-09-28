<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = ['seminar_id', 'student_nim', 'student_name', 'summary', 'status', 'ip_address', 'review_note'];

    public function seminar(): BelongsTo
    {
        return $this->belongsTo(Seminar::class);
    }
}
