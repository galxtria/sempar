import { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { BookOpen, Clock, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';
import SeminarCheckinModal from './SeminarCheckinModal';

function ProgressBar({ count, target, label }) {
  const pct = Math.min((count / target) * 100, 100);
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
        </div>
        <span className="text-lg font-bold text-primary">{count}/{target}</span>
      </div>
    </div>
  );
}

function StudentHome() {
  const nim = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  const [stats, setStats] = useState({ sempro: 0, skripsi: 0, total: 0 });
  const [seminars, setSeminars] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [sRes, semRes, bookRes] = await Promise.all([
        api.get('/stats', { params: { student_nim: nim } }),
        api.get('/seminars/active'),
        api.get('/bookings/my', { params: { student_nim: nim } }),
      ]);
      setStats(sRes.data);
      setSeminars(semRes.data || []);
      setMyReservations(bookRes.data || []);
    } catch (e) {
      setError('Gagal memuat data. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const todayList = useMemo(() => {
    const today = new Date().toDateString();
    return [...seminars]
      .filter(s => new Date(s.date_time).toDateString() === today)
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  }, [seminars]);

  const completion = Math.round(((stats.sempro + stats.skripsi) / 20) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Selamat datang, {name}</h2>
        <p className="text-gray-600 mt-1">NIM {nim} • Pantau progres kelulusan seminar Anda</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressBar count={stats.sempro} target={10} label="Seminar Proposal" />
        <ProgressBar count={stats.skripsi} target={10} label="Seminar Skripsi" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs font-semibold text-gray-600">TOTAL KEHADIRAN VALID</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}<span className="text-base text-gray-500">/20</span></p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs font-semibold text-gray-600">SEMINAR TERSEDIA</p>
          <p className="text-3xl font-bold text-gray-900">{seminars.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <CheckCircle className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs font-semibold text-gray-600">RESERVASI SAYA</p>
          <p className="text-3xl font-bold text-gray-900">{myReservations.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Rekomendasi Hari Ini</h3>
          <span className="text-xs text-gray-500">{todayList.length} seminar berlangsung hari ini</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : todayList.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Tidak ada seminar hari ini. Lihat jadwal mendatang di halaman Daftar Seminar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayList.map(s => {
              const booked = s.bookings_count ?? s.bookings?.length ?? 0;
              const remaining = s.capacity - booked;
              const isReserved = myReservations.some(r => r.seminar_id === s.id);
              return (
                <button key={s.id} onClick={() => setSelected(s)} className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-md transition">
                  <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">{s.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}</span>
                  {isReserved && <span className="ml-2 text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded">TERDAFTAR</span>}
                  <h4 className="font-bold text-gray-900 mt-2">{s.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTime(s.date_time)} • {s.room}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {booked}/{s.capacity} {remaining === 0 && '(PENUH)'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900"><strong>Target kelulusan:</strong> {completion}% — hadiri 10 Seminar Proposal dan 10 Seminar Skripsi, lalu cetak rekapitulasi di halaman Rekap.</p>
      </div>

      {selected && (
        <SeminarCheckinModal seminar={selected} nim={nim} name={name} onClose={() => setSelected(null)} onChanged={refresh} />
      )}
    </div>
  );
}

export default StudentHome;
