import { useState } from 'react';
import api from '../config/api';
import { Plus } from 'lucide-react';

const emptyForm = {
  title: '',
  student_name: '',
  supervisor: '',
  examiner_1: '',
  examiner_2: '',
  description: '',
  type: 'sempro',
  room: '',
  capacity: 30,
  strict_network: false,
  date_time: ''
};

function AdminCreate() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createdPin, setCreatedPin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setCreatedPin('');

    try {
      const datetime = new Date(form.date_time).toISOString().slice(0, 19).replace('T', ' ');
      const res = await api.post('/seminars', {
        ...form,
        date_time: datetime,
        capacity: parseInt(form.capacity),
        strict_network: !!form.strict_network,
      });
      setCreatedPin(res.data.pin);
      setForm(emptyForm);
      setMessage('Jadwal seminar berhasil dibuat!');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Gagal menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          Buat Jadwal Seminar
        </h2>
        <p className="text-gray-600 mt-1">PIN 4 digit dibuat otomatis & aktif 10 menit</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.includes('berhasil') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      {createdPin && (
        <div className="p-6 bg-gradient-to-r from-primary to-accent text-white rounded-lg">
          <p className="text-sm opacity-90">Kode PIN seminar baru:</p>
          <p className="text-4xl font-mono font-bold tracking-widest mt-1">{createdPin}</p>
          <p className="text-xs opacity-80 mt-2">Umumkan PIN ini secara lisan di ruangan</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Seminar</label>
              <input
                type="text"
                placeholder="Contoh: Implementasi Machine Learning pada IoT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
              <textarea
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kapasitas</label>
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
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.strict_network}
                  onChange={(e) => setForm({ ...form, strict_network: e.target.checked })}
                  className="w-4 h-4 mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-700">Wajib jaringan kampus</span>
                  <span className="block text-xs text-gray-500">Presensi dari luar IP kampus ditahan sebagai menunggu verifikasi (atur daftar IP di CAMPUS_IPS)</span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-accent disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminCreate;
