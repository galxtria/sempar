import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { Radio, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

function AdminLive() {
  const [seminars, setSeminars] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await api.get('/seminars');
      setSeminars(res.data || []);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/seminars/${id}`);
      setDetail(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
  }, [selectedId, fetchDetail]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => {
      fetchList();
      if (selectedId) fetchDetail(selectedId);
    }, 5000);
    return () => clearInterval(t);
  }, [autoRefresh, selectedId, fetchList, fetchDetail]);

  const handleReview = async (attendanceId, status) => {
    try {
      await api.patch(`/attendances/${attendanceId}`, { status });
      fetchDetail(selectedId);
      fetchList();
    } catch (e) {
      alert('Gagal memperbarui status');
    }
  };

  const pinExpired = detail ? new Date() > new Date(detail.expires_at) : false;
  const pendings = detail?.attendances?.filter(a => a.status === 'pending') || [];
  const valids = detail?.attendances?.filter(a => a.status === 'valid') || [];
  const rejecteds = detail?.attendances?.filter(a => a.status === 'rejected') || [];
  const ipCounts = {};
  (detail?.attendances || []).forEach(a => {
    if (a.ip_address) ipCounts[a.ip_address] = (ipCounts[a.ip_address] || 0) + 1;
  });
  const sharedIp = Object.entries(ipCounts).filter(([, c]) => c > 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            Monitor Kehadiran Real-Time
          </h2>
          <p className="text-gray-600 mt-1">Pantau mahasiswa yang masuk beserta hasil cek AI</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="w-4 h-4" />
          Auto-refresh 5 detik {lastUpdate && <span className="text-xs text-gray-500">• {lastUpdate.toLocaleTimeString('id-ID')}</span>}
        </label>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Ruangan / Seminar</label>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
          <option value="">-- Pilih seminar yang sedang berlangsung --</option>
          {seminars.map(s => (
            <option key={s.id} value={s.id}>
              {s.room} • {s.title} • {formatTime(s.date_time)}
            </option>
          ))}
        </select>
      </div>

      {!selectedId && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Pilih seminar untuk memantau kehadiran real-time</p>
        </div>
      )}

      {detail && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-6 rounded-lg border-2 text-center ${pinExpired ? 'bg-gray-100 border-gray-300' : 'bg-gradient-to-br from-primary to-accent border-transparent text-white'}`}>
              <p className={`text-xs font-semibold ${pinExpired ? 'text-gray-600' : 'text-white/80'}`}>PIN AKTIF • {detail.room}</p>
              <p className={`text-5xl font-mono font-bold tracking-widest my-2 ${pinExpired ? 'text-gray-400' : ''}`}>{detail.pin}</p>
              <p className={`text-xs flex items-center justify-center gap-1 ${pinExpired ? 'text-gray-500' : 'text-white/80'}`}>
                <Clock className="w-3 h-3" />
                {pinExpired ? 'PIN kedaluwarsa' : `Berlaku hingga ${formatTime(detail.expires_at)}`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{detail.bookings?.length || 0}</p>
                <p className="text-xs text-blue-600">Reservasi</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{valids.length}</p>
                <p className="text-xs text-green-600">Hadir Valid</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <RefreshCw className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-600">{pendings.length}</p>
                <p className="text-xs text-amber-600">Perlu Review</p>
              </div>
            </div>
          </div>

          {pendings.length > 0 && (
            <div className="bg-white rounded-lg border-2 border-amber-300 p-4">
              <h3 className="font-bold text-amber-900 mb-3">Menunggu Verifikasi Manual ({pendings.length})</h3>
              <div className="space-y-2">
                {pendings.map(a => (
                  <div key={a.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{a.student_name} <span className="text-gray-500 font-normal">({a.student_nim})</span></p>
                        <p className="text-xs text-gray-600 mt-1 italic">"{a.summary}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(a.id, 'valid')} className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700">Setujui</button>
                        <button onClick={() => handleReview(a.id, 'rejected')} className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700">Tolak</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-3">Arus Kehadiran ({detail.attendances?.length || 0})</h3>
            {sharedIp.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <strong>Mencurigakan:</strong> {sharedIp.map(([ip, c]) => `${c} perangkat/NIM dari IP ${ip}`).join('; ')} — kemungkinan satu orang mengabsenkan banyak NIM.
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(detail.attendances || []).map(a => (
                <div key={a.id} className="flex justify-between items-center p-2 rounded border border-gray-100 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{a.student_name} <span className="text-gray-500 font-normal">({a.student_nim})</span></p>
                    <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString('id-ID')}{a.ip_address ? ` • IP ${a.ip_address}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.ip_address && ipCounts[a.ip_address] > 1 && (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-red-200 text-red-800">IP SAMA</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'valid' ? 'bg-green-200 text-green-800' : a.status === 'pending' ? 'bg-amber-200 text-amber-800' : 'bg-red-200 text-red-800'}`}>
                      {a.status === 'valid' ? 'VALID' : a.status === 'pending' ? 'PENDING' : 'DITOLAK'}
                    </span>
                  </div>
                </div>
              ))}
              {(!detail.attendances || detail.attendances.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-6">Belum ada mahasiswa yang melakukan pencatatan</p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">Ditolak AI ({rejecteds.length})</p>
            {rejecteds.length === 0 ? <p>Belum ada.</p> : rejecteds.map(a => (
              <p key={a.id} className="text-xs">• {a.student_name} ({a.student_nim})</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminLive;
