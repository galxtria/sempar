import { useState, useEffect } from 'react';
import api from '../config/api';
import { Plus, Pencil, Trash2, Eye, RefreshCw, X, Clock, Users } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

const emptyForm = {
  title: '', student_name: '', supervisor: '', examiner_1: '', examiner_2: '',
  description: '', type: 'sempro', room: '', capacity: 30, strict_network: false, date_time: '',
};

function AdminJadwal({ readOnly = false }) {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [createdPin, setCreatedPin] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selected, setSelected] = useState(null);

  const fetchSeminars = async () => {
    try {
      const res = await api.get('/seminars');
      setSeminars(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSeminars(); }, []);

  const toBackendTime = (v) => new Date(v).toISOString().slice(0, 19).replace('T', ' ');

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setCreatedPin('');
    try {
      const res = await api.post('/seminars', { ...form, date_time: toBackendTime(form.date_time), capacity: parseInt(form.capacity), strict_network: !!form.strict_network });
      setCreatedPin(res.data.pin);
      setForm(emptyForm);
      setShowForm(false);
      setMessage('Jadwal tersimpan.');
      fetchSeminars();
    } catch (e) {
      setMessage(e.response?.data?.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s) => {
    setEditing(s);
    setEditForm({ title: s.title, student_name: s.student_name, supervisor: s.supervisor || '', examiner_1: s.examiner_1 || '', examiner_2: s.examiner_2 || '', description: s.description || '', type: s.type, room: s.room, capacity: s.capacity, strict_network: !!s.strict_network });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/seminars/${editing.id}`, { ...editForm, capacity: parseInt(editForm.capacity), strict_network: !!editForm.strict_network });
      setSeminars(prev => prev.map(s => s.id === editing.id ? res.data : s));
      if (selected?.id === editing.id) setSelected(res.data);
      setEditing(null);
    } catch (e) {
      alert('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini beserta datanya?')) return;
    await api.delete(`/seminars/${id}`);
    if (selected?.id === id) setSelected(null);
    fetchSeminars();
  };

  const handleRegenPin = async (id) => {
    if (!confirm('Buat PIN baru? PIN lama langsung mati.')) return;
    const res = await api.post(`/seminars/${id}/regenerate-pin`);
    setSeminars(prev => prev.map(s => s.id === id ? res.data : s));
    if (selected?.id === id) setSelected(res.data);
  };

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm';
  const label = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jadwal Seminar</h2>
          <p className="text-gray-600 text-sm mt-1">{seminars.length} jadwal • PIN dibuat otomatis</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-accent flex items-center gap-2 disabled:opacity-40" disabled={readOnly} title={readOnly ? 'Hanya admin yang dapat menambah jadwal' : ''}>
          <Plus className="w-4 h-4" /> {showForm ? 'Tutup' : 'Tambah Jadwal'}
        </button>
      </div>

      {message && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
      {createdPin && (
        <div className="p-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">PIN seminar baru — umumkan lisan di ruangan</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{createdPin}</p>
          </div>
          <button onClick={() => setCreatedPin('')} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={label}>Judul seminar</label>
            <input className={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className={label}>Penyaji</label>
            <input className={input} value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} required />
          </div>
          <div>
            <label className={label}>Pembimbing</label>
            <input className={input} value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} />
          </div>
          <div>
            <label className={label}>Penguji 1</label>
            <input className={input} value={form.examiner_1} onChange={e => setForm({ ...form, examiner_1: e.target.value })} />
          </div>
          <div>
            <label className={label}>Penguji 2</label>
            <input className={input} value={form.examiner_2} onChange={e => setForm({ ...form, examiner_2: e.target.value })} />
          </div>
          <div>
            <label className={label}>Jenis</label>
            <select className={input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="sempro">Proposal</option>
              <option value="skripsi">Skripsi</option>
            </select>
          </div>
          <div>
            <label className={label}>Ruangan</label>
            <input className={input} value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} required />
          </div>
          <div>
            <label className={label}>Kapasitas</label>
            <input type="number" min="1" max="500" className={input} value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div>
            <label className={label}>Waktu</label>
            <input type="datetime-local" className={input} value={form.date_time} onChange={e => setForm({ ...form, date_time: e.target.value })} required />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={!!form.strict_network} onChange={e => setForm({ ...form, strict_network: e.target.checked })} className="w-4 h-4" />
            Wajib jaringan kampus (di luar IP kampus = menunggu verifikasi)
          </label>
          <button disabled={saving} className="sm:col-span-2 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-accent disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Memuat...</p>
      ) : seminars.length === 0 ? (
        <div className="text-center py-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">Belum ada jadwal. Klik Tambah Jadwal.</div>
      ) : (
        <div className="space-y-2">
          {seminars.map(s => {
            const booked = s.bookings?.length || 0;
            return (
              <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(s.date_time)} • {formatDate(s.date_time)}</span>
                    <span>{s.room}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{booked}/{s.capacity}</span>
                  </p>
                  <p className="text-xs mt-0.5">PIN: <strong className="font-mono text-primary">{s.pin}</strong></p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setSelected(s)} title="Detail" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  {!readOnly && (
                    <>
                      <button onClick={() => openEdit(s)} title="Ubah" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleRegenPin(s.id)} title="PIN baru" className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} title="Hapus" className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900">{selected.title}</h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[['Reservasi', `${selected.bookings?.length || 0}/${selected.capacity}`, 'text-blue-600'], ['Valid', selected.attendances?.filter(a => a.status === 'valid').length || 0, 'text-green-600'], ['Pending', selected.attendances?.filter(a => a.status === 'pending').length || 0, 'text-amber-600'], ['Ditolak', selected.attendances?.filter(a => a.status === 'rejected').length || 0, 'text-red-600']].map(([l, v, c]) => (
              <div key={l} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">{l}</p>
                <p className={`text-xl font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Ubah Jadwal</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className={label}>Judul</label>
                <input className={input} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Penyaji</label>
                  <input className={input} value={editForm.student_name} onChange={e => setEditForm({ ...editForm, student_name: e.target.value })} required />
                </div>
                <div>
                  <label className={label}>Pembimbing</label>
                  <input className={input} value={editForm.supervisor} onChange={e => setEditForm({ ...editForm, supervisor: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Jenis</label>
                  <select className={input} value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                    <option value="sempro">Proposal</option>
                    <option value="skripsi">Skripsi</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Ruangan</label>
                  <input className={input} value={editForm.room} onChange={e => setEditForm({ ...editForm, room: e.target.value })} required />
                </div>
                <div>
                  <label className={label}>Kapasitas</label>
                  <input type="number" min="1" max="500" className={input} value={editForm.capacity} onChange={e => setEditForm({ ...editForm, capacity: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={!!editForm.strict_network} onChange={e => setEditForm({ ...editForm, strict_network: e.target.checked })} className="w-4 h-4" />
                Wajib jaringan kampus
              </label>
              <button disabled={saving} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-accent disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminJadwal;
