import { useState, useEffect, useMemo } from 'react';
import api from './config/api';
import { BookOpen, CheckCircle, XCircle, Users, X, Info, CheckSquare, Clock, Search, History } from 'lucide-react';
import { formatTime, formatDate } from './utils/dateFormat';

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

function SeminarDetailModal({ seminar, nim, name, onClose, onChanged }) {
  const [tab, setTab] = useState('info');
  const [reserveLoading, setReserveLoading] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);
  const [reserveMessage, setReserveMessage] = useState('');
  const [presensiMessage, setPresensiMessage] = useState('');
  const [form, setForm] = useState({ pin: '', summary: '', student_name: name });

  const isReserved = seminar.bookings?.some(b => b.student_nim === nim);
  const booked = seminar.bookings_count ?? seminar.bookings?.length ?? 0;
  const remaining = seminar.capacity - booked;

  const handleReserve = async () => {
    setReserveLoading(true);
    setReserveMessage('');
    try {
      const res = await api.post('/bookings', { seminar_id: seminar.id, student_nim: nim, student_name: name });
      setReserveMessage('Reservasi kursi berhasil! Sisa kursi: ' + res.data.remaining);
      setTimeout(() => { onChanged(); onClose(); }, 1500);
    } catch (e) {
      setReserveMessage(e.response?.data?.error || 'Reservasi gagal');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleCancelReserve = async () => {
    if (!confirm('Batalkan reservasi kursi?')) return;
    try {
      const booking = seminar.bookings?.find(b => b.student_nim === nim);
      if (booking) {
        await api.delete(`/bookings/${booking.id}`, { data: { student_nim: nim } });
        onChanged();
        onClose();
      }
    } catch (e) {
      setReserveMessage(e.response?.data?.error || 'Pembatalan gagal');
    }
  };

  const handlePresensi = async (e) => {
    e.preventDefault();
    setPresensiLoading(true);
    setPresensiMessage('');
    try {
      await api.post('/attendances', {
        seminar_id: seminar.id,
        student_nim: nim,
        student_name: form.student_name,
        pin: form.pin,
        summary: form.summary
      });
      setPresensiMessage('Kehadiran berhasil divalidasi dan dicatat.');
      setForm({ pin: '', summary: '', student_name: name });
      setTimeout(() => { onChanged(); }, 1500);
    } catch (e) {
      setPresensiMessage(e.response?.data?.error || 'Pengiriman kehadiran gagal');
    } finally {
      setPresensiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-primary to-accent text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{seminar.title}</h2>
            <p className="text-white/90 mt-1">Penyaji: {seminar.student_name}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Tutup">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 px-6 pt-4 bg-white">
          {[
            { id: 'info', label: 'Informasi Lengkap', icon: Info },
            { id: 'reserve', label: `Reservasi (${booked}/${seminar.capacity})`, icon: Users },
            { id: 'presensi', label: 'Pencatatan Kehadiran', icon: CheckSquare },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 font-medium border-b-2 transition ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 bg-white">
          {tab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-1">JENIS SEMINAR</p>
                  <p className="text-lg font-bold text-gray-900">{seminar.type === 'sempro' ? 'Seminar Proposal' : 'Seminar Skripsi'}</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-600 mb-1">LOKASI</p>
                  <p className="text-lg font-bold text-gray-900">{seminar.room}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">WAKTU PELAKSANAAN</p>
                  <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {formatTime(seminar.date_time)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(seminar.date_time)}</p>
                </div>
                {seminar.supervisor && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">DOSEN PEMBIMBING</p>
                    <p className="text-base font-semibold text-gray-900">{seminar.supervisor}</p>
                  </div>
                )}
                {seminar.examiner_1 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">DOSEN PENGUJI 1</p>
                    <p className="text-base font-semibold text-gray-900">{seminar.examiner_1}</p>
                  </div>
                )}
                {seminar.examiner_2 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">DOSEN PENGUJI 2</p>
                    <p className="text-base font-semibold text-gray-900">{seminar.examiner_2}</p>
                  </div>
                )}
                {seminar.description && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">DESKRIPSI</p>
                    <p className="text-base text-gray-700">{seminar.description}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Panduan:</strong> reservasi kursi dulu, hadir di ruangan, dengarkan PIN dari panitia, lalu catat kehadiran.
                </p>
              </div>
            </div>
          )}

          {tab === 'reserve' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-600 mb-1">SUDAH RESERVASI</p>
                  <p className="text-2xl font-bold text-blue-600">{booked}</p>
                </div>
                <div className={`p-4 rounded-lg border ${remaining === 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-xs font-semibold mb-1 ${remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>SISA KURSI</p>
                  <p className={`text-2xl font-bold ${remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>{remaining}</p>
                </div>
              </div>

              {reserveMessage && (
                <div className={`p-3 rounded-lg text-sm ${reserveMessage.includes('berhasil') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {reserveMessage}
                </div>
              )}

              {isReserved ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-semibold">Anda sudah melakukan reservasi</p>
                  </div>
                  <button onClick={handleCancelReserve} className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium">
                    Batalkan Reservasi
                  </button>
                </div>
              ) : remaining === 0 ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-red-700 font-semibold">Kapasitas Ruangan Penuh</p>
                </div>
              ) : (
                <button onClick={handleReserve} disabled={reserveLoading} className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent disabled:opacity-50 font-semibold transition">
                  {reserveLoading ? 'Sedang Memproses...' : 'Lakukan Reservasi Kursi'}
                </button>
              )}
            </div>
          )}

          {tab === 'presensi' && (
            <form onSubmit={handlePresensi} className="space-y-4">
              {presensiMessage && (
                <div className={`p-3 rounded-lg text-sm ${presensiMessage.includes('berhasil') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {presensiMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Induk Mahasiswa (NIM)</label>
                <input type="text" disabled value={nim} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <input type="text" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode PIN Kehadiran (4 digit)</label>
                <input type="text" placeholder="Masukkan kode PIN yang diumumkan panitia" maxLength="4" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg tracking-widest" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ringkasan Materi Seminar</label>
                <textarea placeholder="Tulis 1-2 kalimat ringkasan materi..." value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter, harus relevan dengan topik seminar</p>
              </div>
              <button type="submit" disabled={presensiLoading} className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent disabled:opacity-50 font-semibold transition">
                {presensiLoading ? 'Sedang Memproses...' : 'Kirim Kehadiran'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const nim = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  const [stats, setStats] = useState({ sempro: 0, skripsi: 0 });
  const [seminars, setSeminars] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeminar, setSelectedSeminar] = useState(null);

  const refreshAll = async (type = filter) => {
    setLoading(true);
    setError('');
    try {
      const [sRes, semRes, bookRes, histRes] = await Promise.all([
        api.get('/stats', { params: { student_nim: nim } }),
        api.get(type === 'all' ? '/seminars/active' : `/seminars/filter/${type}`),
        api.get('/bookings/my', { params: { student_nim: nim } }),
        api.get('/attendances/history', { params: { student_nim: nim } }),
      ]);
      setStats({ sempro: sRes.data.sempro, skripsi: sRes.data.skripsi });
      setSeminars(semRes.data || []);
      setMyReservations(bookRes.data || []);
      setHistory(histRes.data || []);
    } catch (e) {
      setError('Gagal memuat data. Pastikan backend berjalan di ' + (import.meta.env.VITE_API_URL || 'http://localhost:8000/api'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshAll('all'); }, []);

  const handleFilter = (type) => {
    setFilter(type);
    refreshAll(type);
  };

  const visibleSeminars = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...seminars]
      .filter(s => !q || s.title.toLowerCase().includes(q) || s.student_name.toLowerCase().includes(q) || s.room.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  }, [seminars, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Mahasiswa</h2>
        <p className="text-gray-600 mt-1">{name} • {nim}</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressBar count={stats.sempro} target={10} label="Seminar Proposal" />
        <ProgressBar count={stats.skripsi} target={10} label="Seminar Skripsi" />
      </div>

      {myReservations.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-3">Reservasi Kursi Saya ({myReservations.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myReservations.map(r => (
              <div key={r.id} className="bg-white p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-gray-900">{r.seminar?.title}</p>
                <p className="text-xs text-gray-600">{r.seminar?.room} • {r.seminar?.type === 'sempro' ? 'Proposal' : 'Skripsi'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Daftar Seminar yang Tersedia
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'sempro', 'skripsi'].map(f => (
              <button key={f} onClick={() => handleFilter(f)} className={`px-4 py-2 rounded-lg font-medium transition ${filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {f === 'all' ? 'Semua Seminar' : f === 'sempro' ? 'Seminar Proposal' : 'Seminar Skripsi'}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul / penyaji / ruangan..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSeminars.map(s => {
              const booked = s.bookings_count ?? s.bookings?.length ?? 0;
              const remaining = s.capacity - booked;
              const isReserved = myReservations.some(r => r.seminar_id === s.id);
              return (
                <button key={s.id} onClick={() => setSelectedSeminar(s)} className="text-left p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">{s.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}</span>
                    {isReserved && <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> TERDAFTAR</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{s.student_name}</p>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatTime(s.date_time)} • {formatDate(s.date_time)}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">{s.room}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-3 h-3 text-gray-600" />
                    <span className={remaining === 0 ? 'text-red-600 font-bold' : 'text-gray-600'}>{booked}/{s.capacity} {remaining === 0 && '(PENUH)'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && visibleSeminars.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada seminar yang cocok</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Riwayat Kehadiran Saya ({history.length})
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada kehadiran valid. Pilih seminar, reservasi, lalu catat kehadiran dengan PIN.</p>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{h.seminar?.title}</p>
                  <p className="text-xs text-gray-600">{h.seminar?.type === 'sempro' ? 'Proposal' : 'Skripsi'} • {h.seminar?.room} • {formatDate(h.seminar?.date_time)} {formatTime(h.seminar?.date_time)}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-800 rounded">VALID</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSeminar && (
        <SeminarDetailModal seminar={selectedSeminar} nim={nim} name={name} onClose={() => setSelectedSeminar(null)} onChanged={() => refreshAll()} />
      )}
    </div>
  );
}

export default StudentDashboard;
