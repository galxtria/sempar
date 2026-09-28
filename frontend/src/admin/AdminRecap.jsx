import { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { Table, Search, Download, Printer, CheckCircle, XCircle } from 'lucide-react';

function toCSV(rows) {
  const header = ['NIM', 'Nama', 'Sempro Valid', 'Skripsi Valid', 'Total', 'Status'];
  const lines = [header.join(';')];
  rows.forEach(r => {
    lines.push([r.nim, `"${r.name}"`, r.sempro, r.skripsi, r.total, r.eligible ? 'LENGKAP' : 'BELUM'].join(';'));
  });
  return lines.join('\n');
}

function AdminRecap() {
  const [seminars, setSeminars] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/seminars');
        setSeminars(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const master = useMemo(() => {
    const map = {};
    seminars.forEach(s => {
      (s.bookings || []).forEach(b => {
        if (!map[b.student_nim]) map[b.student_nim] = { nim: b.student_nim, name: b.student_name, sempro: 0, skripsi: 0 };
      });
      (s.attendances || []).forEach(a => {
        if (a.status !== 'valid') return;
        if (!map[a.student_nim]) map[a.student_nim] = { nim: a.student_nim, name: a.student_name, sempro: 0, skripsi: 0 };
        if (s.type === 'sempro') map[a.student_nim].sempro += 1;
        else map[a.student_nim].skripsi += 1;
      });
    });
    return Object.values(map).map(r => ({ ...r, total: r.sempro + r.skripsi, eligible: r.sempro >= 10 && r.skripsi >= 10 }));
  }, [seminars]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return master
      .filter(r => !q || r.nim.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      .sort((a, b) => b.total - a.total);
  }, [master, search]);

  const eligibleCount = master.filter(r => r.eligible).length;

  const handleExport = () => {
    const blob = new Blob(['\ufeff' + toCSV(visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rekap-sempar.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-gray-500">Memuat rekapitulasi...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Table className="w-6 h-6 text-primary" />
            Rekapitulasi Global
          </h2>
          <p className="text-gray-600 mt-1">{master.length} mahasiswa tercatat • {eligibleCount} memenuhi syarat 10/10</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> Ekspor Excel (CSV)
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari NIM atau nama mahasiswa..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 font-bold text-gray-700">NIM</th>
              <th className="px-4 py-3 font-bold text-gray-700">Nama</th>
              <th className="px-4 py-3 font-bold text-gray-700 text-center">Sempro</th>
              <th className="px-4 py-3 font-bold text-gray-700 text-center">Skripsi</th>
              <th className="px-4 py-3 font-bold text-gray-700 text-center">Total</th>
              <th className="px-4 py-3 font-bold text-gray-700 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.nim} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-gray-900">{r.nim}</td>
                <td className="px-4 py-3 text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-center font-bold text-blue-600">{r.sempro}/10</td>
                <td className="px-4 py-3 text-center font-bold text-purple-600">{r.skripsi}/10</td>
                <td className="px-4 py-3 text-center font-bold">{r.total}/20</td>
                <td className="px-4 py-3 text-center">
                  {r.eligible ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-200 text-green-800 rounded"><CheckCircle className="w-3 h-3" /> LENGKAP</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded"><XCircle className="w-3 h-3" /> BELUM</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="text-center text-gray-500 py-8">Tidak ada data mahasiswa</p>}
      </div>
    </div>
  );
}

export default AdminRecap;
