import { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Scissors,
  FolderOpen,
  Menu,
  X,
  LogOut,
  Store,
} from 'lucide-react';
import { AppointmentContext } from '../../context/salonContext';

const navItems = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/artists', label: 'Artists', icon: Sparkles },
  { to: '/admin/services', label: 'Services', icon: Scissors },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
];

const AdminLayout = () => {
  const { user, token, setToken, setUser } = useContext(AppointmentContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait for profile load; if loaded and not admin, bounce home
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem('token');
    } catch {
      /* ignore */
    }
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-600 hover:bg-stone-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-4 flex items-center gap-2 border-b border-stone-200 bg-primary text-white">
          <Store className="w-5 h-5 shrink-0" />
          <div>
            <p className="prata-regular text-base leading-tight">Infinity</p>
            <p className="text-[10px] uppercase tracking-wider opacity-90">Admin</p>
          </div>
        </div>

        <div className="p-4 border-b border-stone-100">
          <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-100 space-y-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-stone-100"
          >
            <Store className="w-4 h-4" />
            View site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-4 lg:px-6">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-stone-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="prata-regular text-lg text-gray-800 hidden sm:block">Salon Admin</h1>
          <span className="text-xs text-gray-400 uppercase tracking-wide">Admin panel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            {!user ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
