# SEMPAR - Seminar Participation Tracker MVP

Build dalam 3 hari untuk kampus. Tracking presensi 10 Sempro + 10 Skripsi dengan validasi AI anti-curang.

## Struktur Proyek

```
Sempar/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Models/       # Seminar, Attendance
│   │   ├── Http/Controllers/Api/
│   │   │   ├── SeminarController.php
│   │   │   └── AttendanceController.php
│   │   └── Services/GeminiService.php
│   ├── database/
│   │   ├── migrations/   # seminars, attendances
│   │   └── database.sqlite
│   ├── routes/api.php
│   ├── config/cors.php
│   └── .env
├── frontend/             # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx       # Student dashboard + progress
│   │   ├── AdminPanel.jsx
│   │   ├── MainApp.jsx   # Role switcher
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── sempar.architecture.json
├── sempar-diagram.html   # Archify visualization
└── README.md
```

## Database Schema

**seminars**
- id (PK)
- title, student_name, type (enum: sempro/skripsi), room
- date_time, pin (4-digit auto), expires_at
- timestamps

**attendances**
- id (PK)
- seminar_id (FK), student_nim, student_name
- summary (validated by Gemini), status (valid/rejected)
- timestamps

## Fitur Utama

### Sisi Mahasiswa (/)
- Progress bar: Sempro [X/10], Skripsi [X/10]
- Form presensi: NIM, Nama, Pilih Seminar, PIN, Ringkasan
- Gemini AI validasi ringkasan relevan dengan judul seminar
- Pesan real-time status (valid/rejected)

### Sisi Admin (/admin)
- Form buat seminar: Auto-generate PIN 4-digit, kedaluwarsa 15 menit
- Daftar seminar aktif dengan tombol lihat presensi
- Recap peserta + status validasi AI

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS (putih + aksen merah)
- **Backend**: Laravel 12 + Eloquent ORM
- **Database**: SQLite
- **AI**: Google Gemini API (validasi ringkasan)
- **UI**: Lucide React icons (no emoji)

## Setup

### Backend
```bash
cd backend
php artisan migrate
php artisan serve --port=8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Vite di :5173
```

### .env Backend
```
GEMINI_API_KEY=your_key_here
APP_URL=http://localhost:8000
```

## API Endpoints

- `GET /api/seminars` - List seminar
- `POST /api/seminars` - Create (admin)
- `DELETE /api/seminars/{id}` - Delete (admin)
- `POST /api/attendances` - Submit presensi (validasi PIN + Gemini)
- `GET /api/seminars/{id}/attendances` - Recap peserta
- `GET /api/stats` - Total sempro/skripsi

## Validasi Keamanan

1. PIN unik 4-digit, kedaluwarsa 15 menit
2. Gemini API cek ringkasan relevan (min 10 kata, bukan asal-asalan)
3. Jika tidak relevan → `status: rejected`, progres tidak naik
4. CORS enabled untuk frontend

## Deployment (3 hari deadline)

1. Backend: `php artisan serve` atau Laragon
2. Frontend: `npm run build` → dist/ siap static host
3. Diagram: `sempar-diagram.html` untuk dokumentasi

## Next Steps (Post-MVP)

- Auth login admin
- Export laporan PDF
- Notifikasi email
- Mobile-friendly improvement
- Database PostgreSQL production
