import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Eye, Calendar, LogOut, Users, Clock } from 'lucide-react';
import { formatTime, formatDate } from './utils/dateFormat';

const API = 'http://localhost:8000/api';

function AdminPanel({ onLogout }) {
  const [seminars, setSeminars] = useState([]);
  const [form, setForm] = useState({
    title: '',
    student_name: '',
    supervisor: '',
    examiner_1: '',
    examiner_2: '',
    description: '',
    type: 'sempro',
    room: '',
    capacity: 30,
    date_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const res = await axios.get(`${API}/seminars`);
      setSeminars(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const datetime = new Date(form.date_time).toISOString().slice(0, 19).replace('T', ' ');
      await axios.post(`${API}/seminars`, { 
        ...form, 
        date_time: datetime,
        capacity: parseInt(form.capacity) 
      });
      setForm({ title: '', student_name: '', supervisor: '', examiner_1: '', examiner_2: '', description: '', type: 'sempro', room: '', capacity: 30, date_time: '' });
      fetchSeminars();
      setMessage('Jadwal seminar berhasil dibuat!');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Error: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus jadwal seminar ini?')) {
      try {
        await axios.delete(`${API}/seminars/${id}`);
        fetchSeminars();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Admin - Manajemen Jadwal Seminar
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Buat Jadwal Seminar Baru
            </h2>
            {message && <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('berhasil') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Seminar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Implementasi Machine Learning pada IoT"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Penyaji</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Pembimbing</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.supervisor}
                    onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Penguji 1</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.examiner_1}
                    onChange={(e) => setForm({ ...form, examiner_1: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen Penguji 2</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.examiner_2}
                    onChange={(e) => setForm({ ...form, examiner_2: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi/Topik</label>
                  <textarea
                    placeholder="Ringkasan singkat materi seminar"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="sempro">Seminar Proposal</option>
                    <option value="skripsi">Seminar Skripsi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ruangan</label>
                  <input
                    type="text"
                    placeholder="Lab Komputer / Ruang Sidang 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kapasitas Ruangan</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={form.date_time}
                    onChange={(e) => setForm({ ...form, date_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-accent disabled:opacity-50 transition"
              >
                {loading ? 'Sedang Menyimpan...' : 'Buat Jadwal Seminar'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar Jadwal ({seminars.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {seminars.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada jadwal</p>
              ) : (
                seminars.map(s => {
                  const booked = s.bookings?.length || 0;
                  return (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">PIN: <span className="font-mono font-bold text-primary">{s.pin}</span></p>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                            <Users className="w-3 h-3" />
                            <span>{booked}/{s.capacity}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setSelected(s)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {selected && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Detail: {selected.title}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold">Reservasi</p>
                <p className="text-2xl font-bold text-blue-600">{selected.bookings?.length || 0}/{selected.capacity}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-600 font-semibold">Presensi Valid</p>
                <p className="text-2xl font-bold text-green-600">{selected.attendances?.filter(a => a.status === 'valid').length || 0}</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-semibold">Presensi Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{selected.attendances?.filter(a => a.status === 'rejected').length || 0}</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-600 font-semibold">Sisa Kursi</p>
                <p className="text-2xl font-bold text-amber-600">{selected.capacity - (selected.bookings?.length || 0)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Mahasiswa yang Reservasi:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.bookings && selected.bookings.length > 0 ? (
                    selected.bookings.map(b => (
                      <div key={b.id} className="p-2 bg-blue-50 rounded border border-blue-100 text-sm">
                        <p className="font-semibold text-gray-900">{b.student_name}</p>
                        <p className="text-xs text-gray-600">{b.student_nim}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Belum ada reservasi</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pencatatan Kehadiran:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.attendances && selected.attendances.length > 0 ? (
                    selected.attendances.map(a => (
                      <div key={a.id} className={`p-2 rounded border text-sm ${a.status === 'valid' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{a.student_name}</p>
                            <p className="text-xs text-gray-600">{a.student_nim}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.status === 'valid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Belum ada pencatatan</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
