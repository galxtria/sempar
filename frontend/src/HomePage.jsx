import { Calendar, Clock, Users, CheckCircle, Zap } from 'lucide-react';

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-12 text-white">
        <h1 className="text-4xl font-bold mb-4">Selamat Datang di SEMPAR</h1>
        <p className="text-lg opacity-90">Platform manajemen kehadiran seminar akademik yang modern dan aman</p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Jadwal Terorganisir</h3>
          <p className="text-sm text-gray-600">Lihat daftar lengkap seminar dengan jam, tempat, dan pembimbing</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <Users className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Reservasi Kursi</h3>
          <p className="text-sm text-gray-600">Pesan tempat di seminar pilihan Anda dengan mudah</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <CheckCircle className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-bold text-gray-900 mb-2">Validasi Aman</h3>
          <p className="text-sm text-gray-600">PIN & AI memastikan kehadiran Anda benar-benar di acara</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Cara Kerja</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">1</div>
            <h3 className="font-semibold text-gray-900 mb-2">Lihat Jadwal</h3>
            <p className="text-sm text-gray-600">Buka Dashboard untuk melihat seminar aktif hari ini</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">2</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reservasi</h3>
            <p className="text-sm text-gray-600">Klik seminar & lakukan reservasi kursi</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">3</div>
            <h3 className="font-semibold text-gray-900 mb-2">Hadir</h3>
            <p className="text-sm text-gray-600">Datang ke ruangan pada waktu yang ditentukan</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">4</div>
            <h3 className="font-semibold text-gray-900 mb-2">Absen</h3>
            <p className="text-sm text-gray-600">Masukkan PIN yang diumumkan untuk pencatatan</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Untuk Mahasiswa
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Pantau progress seminar (Proposal & Skripsi)</li>
            <li>✓ Reservasi kursi dengan kapasitas real-time</li>
            <li>✓ Pencatatan kehadiran yang aman dengan PIN</li>
            <li>✓ Validasi materi menggunakan AI</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Untuk Admin/Panitia
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ Buat jadwal seminar dengan data lengkap</li>
            <li>✓ Auto-generate PIN 4 digit unik</li>
            <li>✓ Monitor reservasi & kehadiran real-time</li>
            <li>✓ Laporan lengkap per seminar</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-8 text-center">
        <p className="text-gray-600">
          SEMPAR v1.0 • Seminar Participation Tracker
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Platform ini dirancang untuk meningkatkan efisiensi pencatatan kehadiran seminar akademik
        </p>
      </div>
    </div>
  );
}

export default HomePage;
