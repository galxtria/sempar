import { useState } from 'react';
import LoginPage from './LoginPage';
import StudentSeminar from './student/StudentSeminar';
import StudentHistory from './student/StudentHistory';
import StudentRecap from './student/StudentRecap';
import AdminDashboard from './admin/AdminDashboard';
import AdminLive from './admin/AdminLive';
import AdminJadwal from './admin/AdminJadwal';
import AdminRecap from './admin/AdminRecap';
import { BookOpen, History, Award, BarChart3, Radio, CalendarDays, Table, LogOut } from 'lucide-react';

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
    return 'seminar';
  });

  const handleLogin = (data) => {
    setUser(data);
    setCurrentPage(data.role === 'admin' ? 'dashboard' : data.role === 'dosen' ? 'live' : 'seminar');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    setUser(null);
    setCurrentPage('seminar');
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';
  const isDosen = user.role === 'dosen';
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'live', label: 'Live', icon: Radio },
    { id: 'jadwal', label: 'Jadwal', icon: CalendarDays },
    { id: 'recap', label: 'Rekap', icon: Table },
  ];
  const dosenNav = [
    { id: 'live', label: 'Live & PIN', icon: Radio },
    { id: 'jadwal', label: 'Jadwal', icon: CalendarDays },
  ];
  const studentNav = [
    { id: 'seminar', label: 'Seminar', icon: BookOpen },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'recap', label: 'Rekap', icon: Award },
  ];
  const navItems = isAdmin ? adminNav : isDosen ? dosenNav : studentNav;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-primary">SEMPAR</h1>

          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                    currentPage === item.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 ml-1 border-l border-gray-200">
              <p className="hidden md:block text-xs text-gray-600 max-w-[120px] truncate">{user.name}</p>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Keluar">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!isAdmin && !isDosen && currentPage === 'seminar' && <StudentSeminar />}
        {!isAdmin && !isDosen && currentPage === 'history' && <StudentHistory />}
        {!isAdmin && !isDosen && currentPage === 'recap' && <StudentRecap />}
        {isAdmin && currentPage === 'dashboard' && <AdminDashboard />}
        {(isAdmin || isDosen) && currentPage === 'live' && <AdminLive />}
        {(isAdmin || isDosen) && currentPage === 'jadwal' && <AdminJadwal readOnly={isDosen} />}
        {isAdmin && currentPage === 'recap' && <AdminRecap />}
      </div>
    </div>
  );
}

export default MainApp;
