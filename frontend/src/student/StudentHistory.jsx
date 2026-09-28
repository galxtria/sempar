import { useState, useEffect } from 'react';
import api from '../config/api';
import { History, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

const badge = {
  valid: 'bg-green-200 text-green-800',
  pending: 'bg-amber-200 text-amber-800',
  rejected: 'bg-red-200 text-red-800',
};

const label = {
  valid: 'VALID',
  pending: 'MENUNGGU VERIFIKASI',
  rejected: 'DITOLAK AI',
};

function StudentHistory() {
  const nim = localStorage.getItem('username');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/attendances/history', { params: { student_nim: nim } });
        setItems(res.data || []);
      } catch (e) {
        setError('Gagal memuat riwayat kehadiran.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nim]);

  const valids = items.filter(i => i.status === 'valid');
  const pendings = items.filter(i => i.status === 'pending');
  const rejecteds = items.filter(i => i.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Riwayat Kehadiran
        </h2>
        <p className="text-gray-600 mt-1">Seluruh seminar yang pernah Anda hadiri beserta status validasinya</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-xs font-semibold text-green-600">VALID</p>
          <p className="text-3xl font-bold text-green-700">{valids.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-xs font-semibold text-amber-600">MENUNGGU VERIFIKASI</p>
          <p className="text-3xl font-bold text-amber-700">{pendings.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-xs font-semibold text-red-600">DITOLAK AI</p>
          <p className="text-3xl font-bold text-red-700">{rejecteds.length}</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada riwayat kehadiran</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(h => (
              <div key={h.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{h.seminar?.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(h.seminar?.date_time)} • {formatTime(h.seminar?.date_time)} • {h.seminar?.room}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {h.seminar?.type === 'sempro' ? 'Seminar Proposal' : 'Seminar Skripsi'} • Dicatat {formatDate(h.created_at)}
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">RINGKASAN SAYA</p>
                      <p className="text-sm text-gray-700">{h.summary}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${badge[h.status] || badge.pending}`}>
                    {label[h.status] || h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">Anda memiliki {pendings.length} kehadiran menunggu verifikasi panitia. Status akan berubah setelah ditinjau.</p>
        </div>
      )}

      {rejecteds.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">Ringkasan yang ditolak AI tidak menambah progres. Tulis 1-2 kalimat yang benar-benar relevan dengan judul seminar.</p>
        </div>
      )}
    </div>
  );
}

export default StudentHistory;
