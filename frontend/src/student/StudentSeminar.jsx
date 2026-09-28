import { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { BookOpen, CheckCircle, XCircle, Users, X, Clock, Search } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

// Alur tunggal: lihat info -> amankan kursi -> absen dengan PIN. Tanpa tab.
function SeminarModal({ seminar, nim, name, onClose, onChanged }) {
  const [pin, setPin] = useState('');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ text: '', ok: false });

  const isReserved = seminar.bookings?.some(b => b.student_nim === nim);
  const booked = seminar.bookings_count ?? seminar.bookings?.length ?? 0;
  const remaining = seminar.capacity - booked;
  const wordCount = summary.trim() === '' ? 0 : summary.trim().split(/\s+/).length;

  const handleReserve = async () => {
    setBusy(true);
    setMessage({ text: '', ok: false });
    try {
      await api.post('/bookings', { seminar_id: seminar.id, student_nim: nim, student_name: name });
      setMessage({ text: 'Kursi berhasil diamankan. Saat acara, minta PIN lalu absen di bawah.', ok: true });
      onChanged();
    } catch (e) {
      setMessage({ text: e.response?.data?.error || 'Reservasi gagal', ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleAttend = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage({ text: '', ok: false });
    try {
      const res = await api.post('/attendances', {
        seminar_id: seminar.id, student_nim: nim, student_name: name, pin, summary,
      });
      const ok = res.data.attendance?.status !== 'rejected';
      setMessage({ text: ok ? 'Kehadiran tercatat. Sampai jumpa di seminar berikutnya.' : res.data.error, ok });
      setPin('');
      setSummary('');
      onChanged();
    } catch (e) {
      setMessage({ text: e.response?.data?.error || 'Absen gagal', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">{seminar.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{seminar.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{seminar.student_name}</p>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatTime(seminar.date_time)} • {formatDate(seminar.date_time)} • {seminar.room}
            </p>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> {booked}/{seminar.capacity} kursi terisi
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Tutup"><X className="w-5 h-5" /></button>
        </div>

        <div className="h-2 bg-gray-200 rounded-full mb-6">
          <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min((booked / seminar.capacity) * 100, 100)}%` }}></div>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {!isReserved ? (
          <button onClick={handleReserve} disabled={busy || remaining === 0} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
            {remaining === 0 ? 'Kelas Penuh' : busy ? 'Memproses...' : 'Amankan Kursi Saya'}
          </button>
        ) : (
          <form onSubmit={handleAttend} className="space-y-4 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <CheckCircle className="w-4 h-4" /> Kursi Anda aman
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">PIN dari ruangan (4 angka)</label>
              <input value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="Contoh: 1234" className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-xl tracking-widest text-center" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ringkasan <span className="font-normal text-gray-500">(boleh kosong)</span></label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} rows="2" placeholder="Tulis 1 kalimat isi seminar..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              {wordCount > 0 && <p className="text-xs text-gray-500 mt-1">{wordCount} kata</p>}
            </div>
            <button type="submit" disabled={busy} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent disabled:opacity-50">
              {busy ? 'Memproses...' : 'Catat Kehadiran Saya'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function StudentSeminar() {
  const nim = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  const [stats, setStats] = useState({ sempro: 0, skripsi: 0 });
  const [seminars, setSeminars] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const refresh = async (type = filter) => {
    setLoading(true);
    try {
      const [sRes, semRes, bookRes] = await Promise.all([
        api.get('/stats', { params: { student_nim: nim } }),
        api.get(type === 'all' ? '/seminars/active' : `/seminars/filter/${type}`),
        api.get('/bookings/my', { params: { student_nim: nim } }),
      ]);
      setStats(sRes.data);
      setSeminars(semRes.data || []);
      setMyReservations(bookRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh('all'); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...seminars]
      .filter(s => !q || s.title.toLowerCase().includes(q) || s.student_name.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  }, [seminars, search]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-sm text-gray-600">Halo, <strong className="text-gray-900">{name}</strong></p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          {[{ label: 'Proposal', v: stats.sempro }, { label: 'Skripsi', v: stats.skripsi }].map(p => (
            <div key={p.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{p.label}</span>
                <strong className="text-primary">{p.v}/10</strong>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full">
                <div className="h-2.5 bg-primary rounded-full" style={{ width: `${Math.min((p.v / 10) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['all', 'sempro', 'skripsi'].map(f => (
            <button key={f} onClick={() => { setFilter(f); refresh(f); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
              {f === 'all' ? 'Semua' : f === 'sempro' ? 'Proposal' : 'Skripsi'}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari seminar..." className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white border border-gray-200 rounded-lg animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Tidak ada seminar. Coba kata kunci lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(s => {
            const booked = s.bookings_count ?? s.bookings?.length ?? 0;
            const full = booked >= s.capacity;
            const mine = myReservations.some(r => r.seminar_id === s.id);
            return (
              <button key={s.id} onClick={() => setSelected(s)} className="text-left p-4 bg-white border-2 border-gray-200 hover:border-primary rounded-lg transition">
                <div className="flex gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-primary text-white rounded">{s.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}</span>
                  {mine && <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded">KURSI SAYA</span>}
                  {full && !mine && <span className="text-xs font-bold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">PENUH</span>}
                </div>
                <h3 className="font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(s.date_time)} • {s.room}
                </p>
                <p className="text-xs text-gray-500 mt-1">{booked}/{s.capacity} kursi</p>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <SeminarModal seminar={selected} nim={nim} name={name} onClose={() => setSelected(null)} onChanged={refresh} />
      )}
    </div>
  );
}

export default StudentSeminar;
