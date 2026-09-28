import { useState } from 'react';
import api from '../config/api';
import { CheckCircle, XCircle, Users, X, Info, CheckSquare, Clock } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

function SeminarCheckinModal({ seminar, nim, name, onClose, onChanged }) {
  const [tab, setTab] = useState('info');
  const [reserveLoading, setReserveLoading] = useState(false);
  const [presensiLoading, setPresensiLoading] = useState(false);
  const [reserveMessage, setReserveMessage] = useState('');
  const [presensiMessage, setPresensiMessage] = useState('');
  const [form, setForm] = useState({ pin: '', summary: '' });
  const wordCount = form.summary.trim() === '' ? 0 : form.summary.trim().split(/\s+/).length;

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
      const res = await api.post('/attendances', {
        seminar_id: seminar.id,
        student_nim: nim,
        student_name: name,
        pin: form.pin,
        summary: form.summary
      });
      const msg = res.data.attendance?.status === 'pending'
        ? 'Kehadiran diterima dan menunggu verifikasi panitia.'
        : 'Kehadiran berhasil divalidasi dan dicatat.';
      setPresensiMessage(msg);
      setForm({ pin: '', summary: '' });
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
              <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 font-medium border-b-2 transition ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-600'}`}>
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
                <div className={`p-3 rounded-lg text-sm ${presensiMessage.includes('berhasil') || presensiMessage.includes('menunggu') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {presensiMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mahasiswa</label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-gray-600">NIM {nim}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kode PIN Kehadiran (4 digit)</label>
                <p className="text-xs text-gray-600 mb-2">Diumumkan panitia/dosen di ruangan • Berlaku hingga {formatTime(seminar.expires_at)}</p>
                <input type="text" placeholder="Contoh: 1234" maxLength="4" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg tracking-widest" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ringkasan Materi Seminar <span className="font-normal text-gray-500">(opsional)</span></label>
                <p className="text-xs text-gray-600 mb-2">Boleh dikosongkan. Jika diisi, ringkasan dicek AI dan harus relevan dengan judul</p>
                <textarea placeholder="Tulis ringkasan di sini..." value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <p className={`text-xs mt-1 ${wordCount >= 10 ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>{wordCount === 0 ? 'Dikosongkan — langsung tercatat valid' : `${wordCount} kata • minimal 10 kata yang relevan`}</p>
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

export default SeminarCheckinModal;
