import { useState, useEffect } from 'react';
import api from '../config/api';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

function AdminDashboard() {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/seminars');
      setSeminars(res.data || []);
    } catch (e) {
      setError('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const totalSeminars = seminars.length;
  const totalCapacity = seminars.reduce((s, x) => s + (x.capacity || 0), 0);
  const totalBooked = seminars.reduce((s, x) => s + (x.bookings?.length || 0), 0);
  const totalValid = seminars.reduce((s, x) => s + (x.attendances?.filter(a => a.status === 'valid').length || 0), 0);
  const totalRejected = seminars.reduce((s, x) => s + (x.attendances?.filter(a => a.status === 'rejected').length || 0), 0);

  const upcoming = [...seminars]
    .filter(s => new Date(s.date_time) >= new Date())
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
    .slice(0, 5);

  const cards = [
    { label: 'Total Seminar', value: totalSeminars, icon: Calendar, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600' },
    { label: 'Kursi Terisi', value: `${totalBooked}/${totalCapacity}`, icon: Users, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600' },
    { label: 'Kehadiran Valid', value: totalValid, icon: CheckCircle, bg: 'bg-green-50 border-green-200', text: 'text-green-600' },
    { label: 'Kehadiran Ditolak', value: totalRejected, icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-600' },
  ];

  if (loading) return <p className="text-gray-500">Memuat dashboard...</p>;
  if (error) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Utama</h2>
        <p className="text-gray-600 mt-1">Ringkasan aktivitas seminar akademik</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`p-5 rounded-lg border ${c.bg}`}>
              <Icon className={`w-6 h-6 ${c.text} mb-3`} />
              <p className="text-xs font-semibold text-gray-600">{c.label.toUpperCase()}</p>
              <p className={`text-3xl font-bold ${c.text} mt-1`}>{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Jadwal Mendatang</h3>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada jadwal mendatang</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(s.date_time)} • {formatDate(s.date_time)} • {s.room}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">
                  {s.type === 'sempro' ? 'PROPOSAL' : 'SKRIPSI'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
