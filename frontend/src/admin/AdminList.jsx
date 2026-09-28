import { useState, useEffect } from 'react';
import api from '../config/api';
import { List, Trash2, Eye, Clock, Pencil, RefreshCw, X } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

function AdminList({ readOnly = false }) {
  const [seminars, setSeminars] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const res = await api.get('/seminars');
      setSeminars(res.data || []);
    } catch (e) {
      setError('Gagal memuat daftar seminar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await api.delete(`/seminars/${id}`);
      fetchSeminars();
    } catch (e) {
      setError('Gagal menghapus jadwal.');
    }
  };

  const openEdit = (s) => {
    setEditing(s);
    setEditForm({
      title: s.title,
      student_name: s.student_name,
      supervisor: s.supervisor || '',
      examiner_1: s.examiner_1 || '',
      examiner_2: s.examiner_2 || '',
      description: s.description || '',
      type: s.type,
      room: s.room,
      capacity: s.capacity,
      strict_network: !!s.strict_network,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/seminars/${editing.id}`, { ...editForm, capacity: parseInt(editForm.capacity), strict_network: !!editForm.strict_network });
      setSeminars(prev => prev.map(s => s.id === editing.id ? res.data : s));
      setSelected(res.data);
      setEditing(null);
    } catch (err) {
      setError('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenPin = async (id) => {
    if (!confirm('Buat ulang PIN seminar ini? PIN lama tidak berlaku lagi.')) return;
    try {
      const res = await api.post(`/seminars/${id}/regenerate-pin`);
      setSeminars(prev => prev.map(s => s.id === id ? res.data : s));
      if (selected?.id === id) setSelected(res.data);
    } catch (e) {
      setError('Gagal membuat ulang PIN.');
    }
  };

  if (loading) return <p className="text-gray-500">Memuat daftar seminar...</p>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <List className="w-6 h-6 text-primary" />
          Daftar Seminar
        </h2>
        <p className="text-gray-600 mt-1">Total: {seminars.length} jadwal</p>
      </div>

      {seminars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">Belum ada jadwal seminar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seminars.map(s => {
            const booked = s.bookings?.length || 0;
            const valid = s.attendances?.filter(a => a.status === 'valid').length || 0;
            const rejected = s.attendances?.filter(a => a.status === 'rejected').length || 0;

            return (
              <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">
                        {s.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}
                      </span>
                      <h3 className="font-bold text-gray-900">{s.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">Penyaji: {s.student_name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(s.date_time)}
                      </span>
                      <span>{formatDate(s.date_time)}</span>
                      <span>{s.room}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs font-semibold">
                      <span className="text-blue-600">Reservasi: {booked}/{s.capacity}</span>
                      <span className="text-green-600">Valid: {valid}</span>
                      <span className="text-red-600">Ditolak: {rejected}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PIN: <span className="font-mono text-primary">{s.pin}</span></p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(s)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Lihat detail"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Ubah jadwal"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRegenPin(s.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Buat ulang PIN"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">{selected.title}</h3>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 font-semibold">RESERVASI</p>
              <p className="text-2xl font-bold text-blue-600">{selected.bookings?.length || 0}/{selected.capacity}</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-600 font-semibold">VALID</p>
              <p className="text-2xl font-bold text-green-600">{selected.attendances?.filter(a => a.status === 'valid').length || 0}</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 font-semibold">DITOLAK</p>
              <p className="text-2xl font-bold text-red-600">{selected.attendances?.filter(a => a.status === 'rejected').length || 0}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-600 font-semibold">SISA</p>
              <p className="text-2xl font-bold text-amber-600">{selected.capacity - (selected.bookings?.length || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Mahasiswa Reservasi ({selected.bookings?.length || 0})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selected.bookings?.length > 0 ? (
                  selected.bookings.map(b => (
                    <div key={b.id} className="p-2 bg-blue-50 rounded border border-blue-100 text-sm">
                      <p className="font-semibold text-gray-900">{b.student_name}</p>
                      <p className="text-xs text-gray-600">{b.student_nim}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Belum ada</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-3">Pencatatan Kehadiran ({selected.attendances?.length || 0})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selected.attendances?.length > 0 ? (
                  selected.attendances.map(a => (
                    <div key={a.id} className={`p-2 rounded border text-sm ${a.status === 'valid' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{a.student_name}</p>
                          <p className="text-xs text-gray-600">{a.student_nim}</p>
                        </div>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${a.status === 'valid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Belum ada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ubah Jadwal Seminar</h3>
              <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Seminar</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Penyaji</label>
                  <input type="text" value={editForm.student_name} onChange={e => setEditForm({ ...editForm, student_name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Pembimbing</label>
                  <input type="text" value={editForm.supervisor} onChange={e => setEditForm({ ...editForm, supervisor: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Penguji 1</label>
                  <input type="text" value={editForm.examiner_1} onChange={e => setEditForm({ ...editForm, examiner_1: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Penguji 2</label>
                  <input type="text" value={editForm.examiner_2} onChange={e => setEditForm({ ...editForm, examiner_2: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="sempro">Seminar Proposal</option>
                    <option value="skripsi">Seminar Skripsi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ruangan</label>
                  <input type="text" value={editForm.room} onChange={e => setEditForm({ ...editForm, room: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kapasitas</label>
                  <input type="number" min="1" max="500" value={editForm.capacity} onChange={e => setEditForm({ ...editForm, capacity: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea rows="2" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
                <input type="checkbox" checked={!!editForm.strict_network} onChange={e => setEditForm({ ...editForm, strict_network: e.target.checked })} className="w-4 h-4 mt-1" />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Wajib jaringan kampus</span>
                  <span className="block text-xs text-gray-500">Presensi dari luar IP kampus ditahan untuk verifikasi manual</span>
                </span>
              </label>
              <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-accent disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminList;
