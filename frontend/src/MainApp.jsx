import { useState } from 'react';
import LoginPage from './LoginPage';
import StudentHome from './student/StudentHome';
import StudentExplore from './student/StudentExplore';
import StudentHistory from './student/StudentHistory';
import StudentRecap from './student/StudentRecap';
import AdminDashboard from './admin/AdminDashboard';
import AdminLive from './admin/AdminLive';
import AdminCreate from './admin/AdminCreate';
import AdminList from './admin/AdminList';
import AdminRecap from './admin/AdminRecap';
import { Home, Search, History, Award, BarChart3, Radio, Plus, List, Table, LogOut, KeyRound } from 'lucide-react';

function MainApp() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    return token ? { token, role, username, name } : null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin') return 'dashboard';
    if (role === 'dosen') return 'live';
    return 'home';
  });

  const handleLogin = (data) => {
    setUser(data);
    setCurrentPage(data.role === 'admin' ? 'dashboard' : data.role === 'dosen' ? 'live' : 'home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    setUser(null);
    setCurrentPage('home');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';
  const isDosen = user.role === 'dosen';
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'live', label: 'Live Monitor', icon: Radio },
    { id: 'create', label: 'Buat Jadwal', icon: Plus },
    { id: 'list', label: 'Daftar Seminar', icon: List },
    { id: 'recap', label: 'Rekap Global', icon: Table },
  ];
  // Dosen: hanya butuh PIN + pantau ruangan (tanpa CRUD jadwal)
  const dosenNav = [
    { id: 'live', label: 'Live Monitor & PIN', icon: KeyRound },
    { id: 'list', label: 'Daftar Seminar', icon: List },
  ];
  const studentNav = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'explore', label: 'Daftar Seminar', icon: Search },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'recap', label: 'Rekap', icon: Award },
  ];
  const navItems = isAdmin ? adminNav : isDosen ? dosenNav : studentNav;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">SEMPAR</h1>
            <p className="text-xs text-gray-600">Seminar Participation Tracker</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-2 flex-wrap">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                      currentPage === item.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 sm:pl-6 sm:border-l sm:border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{isAdmin ? 'Administrator' : isDosen ? 'Dosen' : 'Mahasiswa'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!isAdmin && currentPage === 'home' && <StudentHome />}
        {!isAdmin && currentPage === 'explore' && <StudentExplore />}
        {!isAdmin && currentPage === 'history' && <StudentHistory />}
        {!isAdmin && currentPage === 'recap' && <StudentRecap />}
        {isAdmin && currentPage === 'dashboard' && <AdminDashboard />}
        {isAdmin && currentPage === 'live' && <AdminLive />}
        {isAdmin && currentPage === 'create' && <AdminCreate />}
        {isAdmin && currentPage === 'list' && <AdminList />}
        {isAdmin && currentPage === 'recap' && <AdminRecap />}
        {isDosen && (currentPage === 'live' || currentPage === 'dashboard') && <AdminLive />}
        {isDosen && currentPage === 'list' && <AdminList readOnly />}
      </div>
    </div>
  );
}

export default MainApp;
