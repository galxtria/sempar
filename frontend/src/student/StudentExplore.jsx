import { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { BookOpen, Clock, Users, CheckCircle, Search } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';
import SeminarCheckinModal from './SeminarCheckinModal';

function StudentExplore() {
  const nim = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  const [seminars, setSeminars] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = async (type = filter) => {
    setLoading(true);
    setError('');
    try {
      const [semRes, bookRes] = await Promise.all([
        api.get(type === 'all' ? '/seminars/active' : `/seminars/filter/${type}`),
        api.get('/bookings/my', { params: { student_nim: nim } }),
      ]);
      setSeminars(semRes.data || []);
      setMyReservations(bookRes.data || []);
    } catch (e) {
      setError('Gagal memuat jadwal seminar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh('all'); }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...seminars]
      .filter(s => !q || s.title.toLowerCase().includes(q) || s.student_name.toLowerCase().includes(q) || s.room.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  }, [seminars, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Daftar Seminar</h2>
        <p className="text-gray-600 mt-1">Jelajahi seluruh jadwal seminar mendatang</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'sempro', 'skripsi'].map(f => (
              <button key={f} onClick={() => { setFilter(f); refresh(f); }} className={`px-4 py-2 rounded-lg font-medium transition ${filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {f === 'all' ? 'Semua' : f === 'sempro' ? 'Proposal' : 'Skripsi'}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul / penyaji / ruangan..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(s => {
              const booked = s.bookings_count ?? s.bookings?.length ?? 0;
              const remaining = s.capacity - booked;
              const isReserved = myReservations.some(r => r.seminar_id === s.id);
              return (
                <button key={s.id} onClick={() => setSelected(s)} className="text-left p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition group">
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

        {!loading && visible.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Tidak ada seminar yang cocok</p>
          </div>
        )}
      </div>

      {selected && (
        <SeminarCheckinModal seminar={selected} nim={nim} name={name} onClose={() => setSelected(null)} onChanged={refresh} />
      )}
    </div>
  );
}

export default StudentExplore;
