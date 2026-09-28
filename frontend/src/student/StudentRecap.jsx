import { useState, useEffect } from 'react';
import api from '../config/api';
import { Printer, CheckCircle, XCircle, Award } from 'lucide-react';
import { formatTime, formatDate } from '../utils/dateFormat';

function StudentRecap() {
  const nim = localStorage.getItem('username');
  const name = localStorage.getItem('name');

  const [stats, setStats] = useState({ sempro: 0, skripsi: 0, total: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          api.get('/stats', { params: { student_nim: nim } }),
          api.get('/attendances/history', { params: { student_nim: nim } }),
        ]);
        setStats(sRes.data);
        setHistory(hRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nim]);

  const eligible = stats.sempro >= 10 && stats.skripsi >= 10;
  const semproList = history.filter(h => h.seminar?.type === 'sempro');
  const skripsiList = history.filter(h => h.seminar?.type === 'skripsi');

  if (loading) return <p className="text-gray-500">Memuat rekapitulasi...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Rekapitulasi Akhir
        </h2>
        <p className="text-gray-600 mt-1">Laporan kehadiran resmi sebagai syarat pendaftaran sidang</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-lg border ${stats.sempro >= 10 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <p className="text-xs font-semibold text-gray-600">SEMINAR PROPOSAL</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sempro}<span className="text-base text-gray-500">/10</span></p>
          <p className="text-xs mt-1 flex items-center gap-1">{stats.sempro >= 10 ? <CheckCircle className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-gray-400" />} {stats.sempro >= 10 ? 'Target terpenuhi' : `Kurang ${10 - stats.sempro} lagi`}</p>
        </div>
        <div className={`p-5 rounded-lg border ${stats.skripsi >= 10 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
          <p className="text-xs font-semibold text-gray-600">SEMINAR SKRIPSI</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.skripsi}<span className="text-base text-gray-500">/10</span></p>
          <p className="text-xs mt-1 flex items-center gap-1">{stats.skripsi >= 10 ? <CheckCircle className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-gray-400" />} {stats.skripsi >= 10 ? 'Target terpenuhi' : `Kurang ${10 - stats.skripsi} lagi`}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6" id="rekap-print-area">
        <div className="border-b-2 border-primary pb-4 mb-4">
          <h3 className="text-xl font-bold text-gray-900 text-center">SURAT REKAPITULASI KEHADIRAN SEMINAR</h3>
          <p className="text-center text-sm text-gray-600 mt-1">Program Studi • Tahun Akademik 2025/2026</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-600">Nama</p>
            <p className="font-bold text-gray-900">{name}</p>
          </div>
          <div>
            <p className="text-gray-600">NIM</p>
            <p className="font-bold text-gray-900">{nim}</p>
          </div>
        </div>

        <h4 className="font-bold text-gray-900 mb-2">A. Seminar Proposal ({semproList.length})</h4>
        <div className="space-y-1 mb-6">
          {semproList.length === 0 && <p className="text-sm text-gray-500">Belum ada.</p>}
          {semproList.map((h, i) => (
            <p key={h.id} className="text-sm text-gray-700">{i + 1}. {h.seminar?.title} — {formatDate(h.seminar?.date_time)} {formatTime(h.seminar?.date_time)}</p>
          ))}
        </div>

        <h4 className="font-bold text-gray-900 mb-2">B. Seminar Skripsi ({skripsiList.length})</h4>
        <div className="space-y-1 mb-6">
          {skripsiList.length === 0 && <p className="text-sm text-gray-500">Belum ada.</p>}
          {skripsiList.map((h, i) => (
            <p key={h.id} className="text-sm text-gray-700">{i + 1}. {h.seminar?.title} — {formatDate(h.seminar?.date_time)} {formatTime(h.seminar?.date_time)}</p>
          ))}
        </div>

        <div className={`p-4 rounded-lg text-sm font-semibold ${eligible ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          {eligible
            ? 'Mahasiswa yang bersangkutan TELAH memenuhi syarat 10 Seminar Proposal dan 10 Seminar Skripsi.'
            : 'Mahasiswa yang bersangkutan BELUM memenuhi syarat kelengkapan seminar.'}
        </div>
      </div>

      <button
        onClick={() => window.print()}
        disabled={!eligible}
        className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" />
        {eligible ? 'Cetak Surat Rekapitulasi' : `Cetak Terkunci (${stats.total}/20)`}
      </button>
      {!eligible && <p className="text-xs text-gray-500">Tombol cetak aktif setelah target 10/10 terpenuhi.</p>}
    </div>
  );
}

export default StudentRecap;
